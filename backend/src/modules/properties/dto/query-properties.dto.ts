import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DealType, PropertyType } from '@prisma/client';

const isBlank = (value: unknown): boolean => typeof value === 'string' && value.trim() === '';

const toOptionalString = ({ value }: { value: unknown }): unknown =>
  isBlank(value) ? undefined : value;

const toOptionalNumber = ({ value }: { value: unknown }): unknown => {
  if (isBlank(value) || value === undefined || value === null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const toNumberWithDefault =
  (defaultValue: number) =>
  ({ value }: { value: unknown }): number => {
    if (isBlank(value) || value === undefined || value === null) return defaultValue;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  };

export class QueryPropertiesDto {
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
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Transform(toNumberWithDefault(1))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(toNumberWithDefault(12))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 12;
}
