import { Matches } from 'class-validator';
import { Trim } from '../../../common/transformers/trim.transformer';

export class VerifyOtpDto {
  @Trim()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل معتبر نیست.' })
  mobile!: string;

  @Trim()
  @Matches(/^\d{4,8}$/, { message: 'کد تأیید معتبر نیست.' })
  code!: string;
}
