import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminServiceRequest, UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  documentFileFilter,
  DOCUMENT_MAX_COUNT,
  DOCUMENT_MAX_SIZE_BYTES,
} from '../../common/utils/file-upload.util';
import { AdminServiceRequestsService } from './admin-service-requests.service';
import { CreateAdminServiceRequestDto } from './dto/create-admin-service-request.dto';
import { PreviewSmsDto } from './dto/preview-sms.dto';
import { QueryCasesDto } from './dto/query-cases.dto';
import { UpdateInternalNotesDto } from './dto/update-internal-notes.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('admin-service-requests')
export class AdminServiceRequestsController {
  constructor(private readonly service: AdminServiceRequestsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('documents', DOCUMENT_MAX_COUNT, {
      limits: { fileSize: DOCUMENT_MAX_SIZE_BYTES },
      fileFilter: documentFileFilter,
    }),
  )
  create(
    @Body() dto: CreateAdminServiceRequestDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ): Promise<AdminServiceRequest> {
    return this.service.create(dto, files);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll(@Query() query: QueryCasesDto): Promise<AdminServiceRequest[]> {
    return this.service.findAllForAdmin(query.status, query.serviceType);
  }

  @Get('track/:code')
  track(@Param('code') code: string) {
    return this.service.trackByCode(code);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneForAdmin(id);
  }

  @Get(':id/sms-preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  previewSms(@Param('id', ParseUUIDPipe) id: string, @Query() query: PreviewSmsDto) {
    return this.service.previewSms(id, query.status);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<AdminServiceRequest> {
    return this.service.updateStatus(id, dto);
  }

  @Patch(':id/internal-notes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  updateInternalNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInternalNotesDto,
  ): Promise<AdminServiceRequest> {
    return this.service.updateInternalNotes(id, dto.internalNotes);
  }
}
