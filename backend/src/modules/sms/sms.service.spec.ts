import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';

describe('SmsService', () => {
  const buildService = async (provider: string): Promise<SmsService> => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(provider) },
        },
      ],
    }).compile();

    return moduleRef.get(SmsService);
  };

  it('sends via mock provider without throwing', async () => {
    const service = await buildService('mock');
    await expect(service.send('09121234567', 'hello')).resolves.toBeUndefined();
  });

  it('sendOtp delegates to send with formatted text', async () => {
    const service = await buildService('mock');
    const sendSpy = jest.spyOn(service, 'send');
    await service.sendOtp('09121234567', '12345');
    expect(sendSpy).toHaveBeenCalledWith('09121234567', expect.stringContaining('12345'));
  });

  it('throws for unsupported provider', async () => {
    const service = await buildService('unknown-provider');
    await expect(service.send('09121234567', 'hello')).rejects.toThrow(
      'SMS provider "unknown-provider" is not supported.',
    );
  });
});
