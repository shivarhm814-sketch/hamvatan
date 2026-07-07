import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CaseStatus, UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateContactSettingsDto } from './dto/update-contact-settings.dto';
import { UpdateSmsTemplateDto } from './dto/update-sms-template.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  getPublicSettings() {
    return this.settingsService.getContactSettings();
  }

  @Get('sms-templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getSmsTemplates() {
    return this.settingsService.getSmsTemplates();
  }

  @Patch('sms-templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async updateSmsTemplate(@Body() dto: UpdateSmsTemplateDto) {
    await this.settingsService.updateSmsTemplate(dto.status as CaseStatus, dto.template);
    return this.settingsService.getSmsTemplates();
  }

  @Patch('contact')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  updateContactSettings(@Body() dto: UpdateContactSettingsDto) {
    return this.settingsService.updateContactSettings(dto as Record<string, string>);
  }

  @Get('service-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getServiceStatus() {
    return this.settingsService.getServiceStatus();
  }
}
