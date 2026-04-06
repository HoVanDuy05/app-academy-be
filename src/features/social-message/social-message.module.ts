import { Module } from '@nestjs/common';
import { SocialMessageService } from './social-message.service';
import { SocialMessageController } from './social-message.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [SocialMessageService],
  controllers: [SocialMessageController],
  exports: [SocialMessageService],
})
export class SocialMessageModule {}
