import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Property, PropertyImage, UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { imageFileFilter, IMAGE_MAX_SIZE_BYTES } from '../../common/utils/file-upload.util';
import { CreatePropertyDto } from './dto/create-property.dto';
import { QueryAdminPropertiesDto } from './dto/query-admin-properties.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PaginatedProperties, PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll(@Query() query: QueryPropertiesDto): Promise<PaginatedProperties> {
    return this.propertiesService.findAll(query);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAllForAdmin(@Query() query: QueryAdminPropertiesDto): Promise<PaginatedProperties> {
    return this.propertiesService.findAllForAdmin(query);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findOneForAdmin(@Param('id', ParseUUIDPipe) id: string): Promise<Property> {
    return this.propertiesService.findOneForAdmin(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Property> {
    return this.propertiesService.findOneActive(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  create(@Body() dto: CreatePropertyDto): Promise<Property> {
    return this.propertiesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  archive(@Param('id', ParseUUIDPipe) id: string): Promise<Property> {
    return this.propertiesService.archive(id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: IMAGE_MAX_SIZE_BYTES },
      fileFilter: imageFileFilter,
    }),
  )
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PropertyImage> {
    return this.propertiesService.addImage(id, file);
  }

  @Patch(':id/images/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  reorderImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderImagesDto,
  ): Promise<PropertyImage[]> {
    return this.propertiesService.reorderImages(id, dto.imageIds);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.propertiesService.deleteImage(id, imageId);
  }
}
