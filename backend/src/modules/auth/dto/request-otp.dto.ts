import { Matches } from 'class-validator';
import { Trim } from '../../../common/transformers/trim.transformer';

export class RequestOtpDto {
  @Trim()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل معتبر نیست.' })
  mobile!: string;
}
