import { Module } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AcademicService],
  controllers: [AcademicController],
  exports: [AcademicService],
})
export class AcademicModule {}
