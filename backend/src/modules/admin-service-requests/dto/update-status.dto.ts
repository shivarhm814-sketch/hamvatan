import { CaseStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsEnum(CaseStatus)
  status!: CaseStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
