import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authServiceMock = {
    requestOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('delegates otp request to the service', async () => {
    authServiceMock.requestOtp.mockResolvedValue({ ttlSeconds: 120 });
    const result = await controller.requestOtp({ mobile: '09121234567' });
    expect(authServiceMock.requestOtp).toHaveBeenCalledWith('09121234567');
    expect(result).toEqual({ ttlSeconds: 120 });
  });

  it('delegates otp verification to the service', async () => {
    const payload = {
      accessToken: 'jwt',
      user: { id: 'u1', mobile: '09121234567', role: 'CUSTOMER', fullName: null },
    };
    authServiceMock.verifyOtp.mockResolvedValue(payload);
    const result = await controller.verifyOtp({ mobile: '09121234567', code: '12345' });
    expect(authServiceMock.verifyOtp).toHaveBeenCalledWith('09121234567', '12345');
    expect(result).toEqual(payload);
  });
});
