import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { StorageModule } from '../storage/storage.module';
import { AdminServiceRequestsController } from './admin-service-requests.controller';
import { AdminServiceRequestsService } from './admin-service-requests.service';

@Module({
  imports: [StorageModule, NotificationsModule, SettingsModule],
  controllers: [AdminServiceRequestsController],
  providers: [AdminServiceRequestsService],
  exports: [AdminServiceRequestsService],
})
export class AdminServiceRequestsModule {}
