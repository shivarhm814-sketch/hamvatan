import { IsString, Matches, MinLength } from 'class-validator';
import { Trim } from '../../../common/transformers/trim.transformer';

export class CreateContactRequestDto {
  @Trim()
  @IsString()
  @MinLength(2)
  name!: string;

  @Trim()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل معتبر نیست.' })
  mobile!: string;

  @Trim()
  @IsString()
  @MinLength(5)
  message!: string;
}
