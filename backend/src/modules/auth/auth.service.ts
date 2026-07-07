import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomInt, timingSafeEqual } from 'crypto';
import { RedisService } from '../redis/redis.service';
import { SMS_SENDER, SmsSender } from '../sms/sms-sender.interface';
import { UsersService } from '../users/users.service';

export interface VerifyOtpResult {
  accessToken: string;
  user: { id: string; mobile: string; role: string; fullName: string | null };
}

const codeKey = (mobile: string) => `otp:code:${mobile}`;
const verifyAttemptsKey = (mobile: string) => `otp:verify-attempts:${mobile}`;
const requestCountKey = (mobile: string) => `otp:request-count:${mobile}`;

const REQUEST_WINDOW_SECONDS = 600;
const REQUEST_MAX_PER_WINDOW = 5;

@Injectable()
export class AuthService {
  private readonly otpLength: number;
  private readonly otpTtlSeconds: number;
  private readonly otpMaxAttempts: number;
  // Dev convenience only: with the mock SMS provider outside production, every OTP is this
  // fixed value so testers can log in without reading Redis/logs. Never applies to a real
  // SMS provider, so this can't accidentally activate in production.
  private readonly useFixedDevCode: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @Inject(SMS_SENDER) private readonly smsSender: SmsSender,
  ) {
    this.otpLength = this.configService.get<number>('otp.length') ?? 5;
    this.otpTtlSeconds = this.configService.get<number>('otp.ttlSeconds') ?? 120;
    this.otpMaxAttempts = this.configService.get<number>('otp.maxAttempts') ?? 5;
    this.useFixedDevCode =
      this.configService.get<string>('sms.provider') === 'mock' &&
      this.configService.get<string>('nodeEnv') !== 'production';
  }

  async requestOtp(mobile: string): Promise<{ ttlSeconds: number }> {
    const requestCount = await this.redis.incr(requestCountKey(mobile));
    if (requestCount === 1) {
      await this.redis.expire(requestCountKey(mobile), REQUEST_WINDOW_SECONDS);
    }
    if (requestCount > REQUEST_MAX_PER_WINDOW) {
      throw new HttpException(
        'تعداد درخواست‌های کد تأیید بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = this.generateCode();
    await this.redis.set(codeKey(mobile), code, 'EX', this.otpTtlSeconds);
    await this.redis.del(verifyAttemptsKey(mobile));

    await this.smsSender.sendOtp(mobile, code);

    return { ttlSeconds: this.otpTtlSeconds };
  }

  async verifyOtp(mobile: string, code: string): Promise<VerifyOtpResult> {
    const storedCode = await this.redis.get(codeKey(mobile));
    if (!storedCode) {
      throw new HttpException('کد تأیید منقضی شده یا صادر نشده است.', HttpStatus.BAD_REQUEST);
    }

    const attempts = await this.redis.incr(verifyAttemptsKey(mobile));
    if (attempts === 1) {
      await this.redis.expire(verifyAttemptsKey(mobile), this.otpTtlSeconds);
    }
    if (attempts > this.otpMaxAttempts) {
      await this.redis.del(codeKey(mobile));
      throw new HttpException(
        'تعداد تلاش‌های مجاز برای این کد به پایان رسیده است. کد جدید درخواست کنید.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!this.isCodeMatch(storedCode, code)) {
      throw new HttpException('کد تأیید نادرست است.', HttpStatus.UNAUTHORIZED);
    }

    await this.redis.del(codeKey(mobile), verifyAttemptsKey(mobile), requestCountKey(mobile));

    const user = await this.usersService.findOrCreateByMobile(mobile);
    if (!user.isActive) {
      throw new HttpException('دسترسی این حساب غیرفعال شده است.', HttpStatus.FORBIDDEN);
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      mobile: user.mobile,
      role: user.role,
    });

    return {
      accessToken,
      user: { id: user.id, mobile: user.mobile, role: user.role, fullName: user.fullName },
    };
  }

  private generateCode(): string {
    if (this.useFixedDevCode) {
      return '1'.repeat(this.otpLength);
    }
    const max = 10 ** this.otpLength;
    const value = randomInt(0, max);
    return value.toString().padStart(this.otpLength, '0');
  }

  private isCodeMatch(stored: string, provided: string): boolean {
    const storedBuffer = Buffer.from(stored);
    const providedBuffer = Buffer.from(provided);
    if (storedBuffer.length !== providedBuffer.length) {
      return false;
    }
    return timingSafeEqual(storedBuffer, providedBuffer);
  }
}
