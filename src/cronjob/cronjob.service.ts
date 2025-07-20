import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Types } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MediasService } from 'src/medias/medias.service';

@Injectable()
export class CronjobService {
  private readonly logger = new Logger(CronjobService.name);

  constructor(
    private readonly mediaService: MediasService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async handleCleanup() {
    this.logger.log('Cron: Đang dọn dẹp ảnh isTemporary=true');

    const expiredMediaList = await this.mediaService.getAllTemporarayMedia();

    for (const media of expiredMediaList) {
      this.logger.log(`🗑 Xoá ${media.publicId} (${media.url})`);

      try {
        await this.cloudinaryService.deleteFile(media.publicId as string);
        await this.mediaService.deleteMedia(
          (media._id as Types.ObjectId).toString(),
        );
      } catch (err) {
        this.logger.error(`❌ Lỗi xoá ${media.publicId}: ${err.message}`);
      }
    }

    this.logger.log(`✅ Đã xử lý ${expiredMediaList.length} media hết hạn`);
  }
}
