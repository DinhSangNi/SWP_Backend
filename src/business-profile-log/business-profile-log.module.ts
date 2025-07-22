import { Module } from '@nestjs/common';
import { BusinessProfileLogService } from './business-profile-log.service';
import { BusinessProfileLogController } from './business-profile-log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BusinessProfileLog,
  BusinessProfileLogSchema,
} from './schemas/business-profile-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BusinessProfileLog.name,
        schema: BusinessProfileLogSchema,
      },
    ]),
  ],
  controllers: [BusinessProfileLogController],
  providers: [BusinessProfileLogService],
  exports: [BusinessProfileLogService],
})
export class BusinessProfileLogModule {}
