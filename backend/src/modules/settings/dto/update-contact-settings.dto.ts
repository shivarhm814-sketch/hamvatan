import { IsOptional, IsString } from 'class-validator';

export class UpdateContactSettingsDto {
  @IsOptional()
  @IsString()
  'contact.phone'?: string;

  @IsOptional()
  @IsString()
  'contact.phoneSecondary'?: string;

  @IsOptional()
  @IsString()
  'contact.whatsapp'?: string;

  @IsOptional()
  @IsString()
  'contact.address'?: string;

  @IsOptional()
  @IsString()
  'contact.workingHours'?: string;
}
