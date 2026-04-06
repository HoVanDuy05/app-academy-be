import { Module } from '@nestjs/common';
import { ApprovalFlowService } from './approval-flow.service';
import { ApprovalFlowController } from './approval-flow.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [ApprovalFlowService],
  controllers: [ApprovalFlowController],
  exports: [ApprovalFlowService],
})
export class ApprovalFlowModule {}
