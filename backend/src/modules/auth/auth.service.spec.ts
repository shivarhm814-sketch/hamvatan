import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RedisService } from '../redis/redis.service';
import { SMS_SENDER } from '../sms/sms-sender.interface';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  const redisMock = {
    incr: jest.fn(),
    expire: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };
  const smsMock = { send: jest.fn(), sendOtp: jest.fn() };
  const usersMock = { findOrCreateByMobile: jest.fn() };
  const jwtMock = { signAsync: jest.fn() };

  const config: Record<string, number> = {
    'otp.length': 5,
    'otp.ttlSeconds': 120,
    'otp.maxAttempts': 5,
  };
  const configMock = { get: jest.fn((key: string) => config[key]) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: configMock },
        { provide: RedisService, useValue: redisMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: UsersService, useValue: usersMock },
        { provide: SMS_SENDER, useValue: smsMock },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('requestOtp', () => {
    it('generates and sends an otp, resetting verify attempts', async () => {
      redisMock.incr.mockResolvedValue(1);

      const result = await service.requestOtp('09121234567');

      expect(redisMock.set).toHaveBeenCalledWith(
        'otp:code:09121234567',
        expect.stringMatching(/^\d{5}$/),
        'EX',
        120,
      );
      expect(redisMock.del).toHaveBeenCalledWith('otp:verify-attempts:09121234567');
      expect(smsMock.sendOtp).toHaveBeenCalledWith('09121234567', expect.stringMatching(/^\d{5}$/));
      expect(result).toEqual({ ttlSeconds: 120 });
    });

    it('throws 429 once the per-mobile request window is exceeded', async () => {
      redisMock.incr.mockResolvedValue(6);

      await expect(service.requestOtp('09121234567')).rejects.toThrow(HttpException);
      expect(smsMock.sendOtp).not.toHaveBeenCalled();
    });

    it('uses a fixed, well-known code when the mock SMS provider is active outside production', async () => {
      const devConfig: Record<string, string | number> = {
        ...config,
        'sms.provider': 'mock',
        nodeEnv: 'development',
      };
      const devConfigMock = { get: jest.fn((key: string) => devConfig[key]) };
      const moduleRef = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: ConfigService, useValue: devConfigMock },
          { provide: RedisService, useValue: redisMock },
          { provide: JwtService, useValue: jwtMock },
          { provide: UsersService, useValue: usersMock },
          { provide: SMS_SENDER, useValue: smsMock },
        ],
      }).compile();
      const devService = moduleRef.get(AuthService);
      redisMock.incr.mockResolvedValue(1);

      await devService.requestOtp('09121234567');

      expect(redisMock.set).toHaveBeenCalledWith('otp:code:09121234567', '11111', 'EX', 120);
      expect(smsMock.sendOtp).toHaveBeenCalledWith('09121234567', '11111');
    });

    it('never uses the fixed code for a real (non-mock) SMS provider, even outside production', async () => {
      const prodLikeConfig: Record<string, string | number> = {
        ...config,
        'sms.provider': 'kavenegar',
        nodeEnv: 'development',
      };
      const realConfigMock = { get: jest.fn((key: string) => prodLikeConfig[key]) };
      const moduleRef = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: ConfigService, useValue: realConfigMock },
          { provide: RedisService, useValue: redisMock },
          { provide: JwtService, useValue: jwtMock },
          { provide: UsersService, useValue: usersMock },
          { provide: SMS_SENDER, useValue: smsMock },
        ],
      }).compile();
      const realService = moduleRef.get(AuthService);
      redisMock.incr.mockResolvedValue(1);

      await realService.requestOtp('09121234567');

      expect(smsMock.sendOtp).toHaveBeenCalledWith('09121234567', expect.stringMatching(/^\d{5}$/));
      expect(smsMock.sendOtp).not.toHaveBeenCalledWith('09121234567', '11111');
    });
  });

  describe('verifyOtp', () => {
    it('throws 400 when no code was issued', async () => {
      redisMock.get.mockResolvedValue(null);

      await expect(service.verifyOtp('09121234567', '12345')).rejects.toThrow(
        'کد تأیید منقضی شده یا صادر نشده است.',
      );
    });

    it('throws 401 for a wrong code and increments attempts', async () => {
      redisMock.get.mockResolvedValue('12345');
      redisMock.incr.mockResolvedValue(1);

      await expect(service.verifyOtp('09121234567', '00000')).rejects.toThrow(
        'کد تأیید نادرست است.',
      );
      expect(redisMock.incr).toHaveBeenCalledWith('otp:verify-attempts:09121234567');
    });

    it('throws 429 once max attempts are exceeded and clears the code', async () => {
      redisMock.get.mockResolvedValue('12345');
      redisMock.incr.mockResolvedValue(6);

      await expect(service.verifyOtp('09121234567', '00000')).rejects.toThrow(HttpException);
      expect(redisMock.del).toHaveBeenCalledWith('otp:code:09121234567');
    });

    it('issues a JWT and clears otp state on success', async () => {
      redisMock.get.mockResolvedValue('12345');
      redisMock.incr.mockResolvedValue(1);
      usersMock.findOrCreateByMobile.mockResolvedValue({
        id: 'u1',
        mobile: '09121234567',
        role: 'CUSTOMER',
        fullName: null,
        isActive: true,
      });
      jwtMock.signAsync.mockResolvedValue('signed-jwt');

      const result = await service.verifyOtp('09121234567', '12345');

      expect(redisMock.del).toHaveBeenCalledWith(
        'otp:code:09121234567',
        'otp:verify-attempts:09121234567',
        'otp:request-count:09121234567',
      );
      expect(result.accessToken).toBe('signed-jwt');
      expect(result.user.mobile).toBe('09121234567');
    });

    it('throws 403 for a deactivated user and never issues a JWT', async () => {
      redisMock.get.mockResolvedValue('12345');
      redisMock.incr.mockResolvedValue(1);
      usersMock.findOrCreateByMobile.mockResolvedValue({
        id: 'u1',
        mobile: '09121234567',
        role: 'CUSTOMER',
        fullName: null,
        isActive: false,
      });

      await expect(service.verifyOtp('09121234567', '12345')).rejects.toThrow(
        'دسترسی این حساب غیرفعال شده است.',
      );
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });
});
