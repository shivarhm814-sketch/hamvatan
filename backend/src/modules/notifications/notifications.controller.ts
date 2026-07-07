import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { MessageLog, UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { QueryLogsDto } from './dto/query-logs.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('logs')
  findLogs(@Query() query: QueryLogsDto): Promise<MessageLog[]> {
    return this.notificationsService.findLogs(query.status);
  }

  @Post('logs/:id/resend')
  resend(@Param('id', ParseUUIDPipe) id: string): Promise<MessageLog> {
    return this.notificationsService.resend(id);
  }
}
