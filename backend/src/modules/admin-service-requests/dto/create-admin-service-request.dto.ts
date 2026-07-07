import { AdminServiceType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { Trim } from '../../../common/transformers/trim.transformer';

export class CreateAdminServiceRequestDto {
  @Trim()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل معتبر نیست.' })
  contactMobile!: string;

  @IsEnum(AdminServiceType)
  serviceType!: AdminServiceType;

  @IsOptional()
  @IsString()
  notes?: string;
}
