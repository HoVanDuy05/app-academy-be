import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { AcademicModule } from './features/academic/academic.module';
import { ApprovalFlowModule } from './features/approval-flow/approval-flow.module';
import { SocialMessageModule } from './features/social-message/social-message.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { PortalModule } from './features/portal/portal.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AcademicModule,
    ApprovalFlowModule,
    SocialMessageModule,
    NotificationsModule,
    PortalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
