import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SMS_SENDER, SmsSender } from '../src/modules/sms/sms-sender.interface';

class CapturingSmsSender implements SmsSender {
  public lastCode: string | undefined;

  async send(): Promise<void> {
    return;
  }

  async sendOtp(_mobile: string, code: string): Promise<void> {
    this.lastCode = code;
  }
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;
  let capturingSms: CapturingSmsSender;
  let apiPrefix: string;
  const mobile = `09${Math.floor(100000000 + Math.random() * 899999999)}`;

  beforeAll(async () => {
    capturingSms = new CapturingSmsSender();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SMS_SENDER)
      .useValue(capturingSms)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    apiPrefix = app.get(ConfigService).get<string>('apiPrefix') ?? 'api/v1';
    app.setGlobalPrefix(apiPrefix);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects an invalid mobile number with 400', async () => {
    await request(httpServer)
      .post(`/${apiPrefix}/auth/otp/request`)
      .send({ mobile: '12345' })
      .expect(400);
  });

  it('rejects verification with a wrong code with 401', async () => {
    await request(httpServer).post(`/${apiPrefix}/auth/otp/request`).send({ mobile }).expect(200);

    await request(httpServer)
      .post(`/${apiPrefix}/auth/otp/verify`)
      .send({ mobile, code: '00000' })
      .expect(401);
  });

  it('completes the full otp request -> verify -> JWT flow', async () => {
    await request(httpServer).post(`/${apiPrefix}/auth/otp/request`).send({ mobile }).expect(200);

    expect(capturingSms.lastCode).toBeDefined();

    const verifyResponse = await request(httpServer)
      .post(`/${apiPrefix}/auth/otp/verify`)
      .send({ mobile, code: capturingSms.lastCode })
      .expect(200);

    expect(verifyResponse.body.data.accessToken).toEqual(expect.any(String));
    expect(verifyResponse.body.data.user.mobile).toBe(mobile);
  });
});
