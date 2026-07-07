import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsSender } from './sms-sender.interface';

@Injectable()
export class SmsService implements SmsSender {
  private readonly logger = new Logger(SmsService.name);
  private readonly provider: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('sms.provider') ?? 'mock';
  }

  async send(mobile: string, text: string): Promise<void> {
    if (this.provider === 'mock') {
      this.logger.log(`[mock-sms] to=${mobile} text=${text}`);
      return;
    }

    throw new Error(`SMS provider "${this.provider}" is not supported.`);
  }

  async sendOtp(mobile: string, code: string): Promise<void> {
    await this.send(mobile, `کد تأیید شما در هم‌وطن: ${code}`);
  }
}
