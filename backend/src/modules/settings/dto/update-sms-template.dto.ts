import { CaseStatus } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class UpdateSmsTemplateDto {
  @IsEnum(CaseStatus)
  status!: CaseStatus;

  @IsString()
  @MinLength(3)
  template!: string;
}
