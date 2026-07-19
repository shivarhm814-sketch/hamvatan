import { Transform } from 'class-transformer';
import { AdminServiceType, CaseStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

const toOptionalString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class QueryCasesDto {
  @IsOptional()
  @Transform(toOptionalString)
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @IsOptional()
  @Transform(toOptionalString)
  @IsEnum(AdminServiceType)
  serviceType?: AdminServiceType;
}
