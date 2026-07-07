import { Transform } from 'class-transformer';
import { MessageStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

const toOptionalString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class QueryLogsDto {
  @IsOptional()
  @Transform(toOptionalString)
  @IsEnum(MessageStatus)
  status?: MessageStatus;
}
