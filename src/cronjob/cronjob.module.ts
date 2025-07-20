import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobService } from './cronjob.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MediasModule } from 'src/medias/medias.module';

@Module({
  imports: [ScheduleModule.forRoot(), MediasModule, CloudinaryModule],
  providers: [CronjobService],
  exports: [CronjobService],
})
export class CronJobModule {}
