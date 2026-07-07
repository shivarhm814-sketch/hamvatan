import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ContactRequest, UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ContactRequestsService } from './contact-requests.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Controller('contact-requests')
export class ContactRequestsController {
  constructor(private readonly service: ContactRequestsService) {}

  @Post()
  create(@Body() dto: CreateContactRequestDto): Promise<ContactRequest> {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll(): Promise<ContactRequest[]> {
    return this.service.findAll();
  }

  @Patch(':id/handled')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  markHandled(@Param('id', ParseUUIDPipe) id: string): Promise<ContactRequest> {
    return this.service.markHandled(id);
  }
}
