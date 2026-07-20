import { CaseStatus } from '@prisma/client';
import { IsEnum, IsIn, IsString, MinLength } from 'class-validator';
import { SERVICE_CATEGORIES, ServiceCategory } from '../settings.constants';

export class UpdateSmsTemplateDto {
  @IsEnum(CaseStatus)
  status!: CaseStatus;

  @IsIn(SERVICE_CATEGORIES)
  category!: ServiceCategory;

  @IsString()
  @MinLength(3)
  template!: string;
}
