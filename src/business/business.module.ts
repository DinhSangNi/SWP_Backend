import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BusinessProfile,
  BusinessProfileSchema,
} from './schemas/business-profile.schema';
import { MediasModule } from 'src/medias/medias.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusinessProfile.name, schema: BusinessProfileSchema },
    ]),
    MediasModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
