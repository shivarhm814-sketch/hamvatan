import { Transform } from 'class-transformer';
import { PropertyStatus, PropertyType, DealType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const isBlank = (value: unknown): boolean => typeof value === 'string' && value.trim() === '';
const toOptionalString = ({ value }: { value: unknown }): unknown =>
  isBlank(value) ? undefined : value;
const toNumberWithDefault =
  (defaultValue: number) =>
  ({ value }: { value: unknown }): number => {
    if (isBlank(value) || value === undefined || value === null) return defaultValue;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  };

export class QueryAdminPropertiesDto {
  @IsOptional()
  @Transform(toOptionalString)
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @Transform(toOptionalString)
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @Transform(toOptionalString)
  @IsEnum(DealType)
  dealType?: DealType;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  province?: string;

  @IsOptional()
  @Transform(toOptionalString)
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(toNumberWithDefault(1))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(toNumberWithDefault(20))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
