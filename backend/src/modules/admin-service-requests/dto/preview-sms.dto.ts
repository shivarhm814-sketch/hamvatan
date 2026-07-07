import { CaseStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class PreviewSmsDto {
  @IsEnum(CaseStatus)
  status!: CaseStatus;
}
