import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Media, MediaDocument } from './schemas/media.schema';
import { Model, Types } from 'mongoose';
import { MediaTarget, MediaType, MediaUsage } from './types/media.enum';

@Injectable()
export class MediasService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Media.name)
    private readonly mediaModel: Model<Media>,
  ) {}

  async upload(
    file: Express.Multer.File,
    fileType: MediaType,
    userId: string,
    usage?: MediaUsage,
  ): Promise<MediaDocument> {
    const result = await this.cloudinaryService.uploadFile(file, fileType);

    const media = await this.mediaModel.create({
      url: result.secure_url,
      publicId: result.public_id,
      usage: usage ?? MediaUsage.PRODUCT_GALLERY,
      uploader: userId,
      type: fileType,
    });

    return media;
  }

  async updateMediaTarget(
    mediaIds: string[],
    target: MediaTarget,
    targetId: Types.ObjectId,
  ): Promise<MediaDocument[]> {
    const objectIds = mediaIds.map((id) => new Types.ObjectId(id));

    const result = await this.mediaModel.updateMany(
      { _id: { $in: objectIds }, isTemporary: true },
      {
        $set: {
          target,
          targetId,
          isTemporary: false,
        },
      },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException(
        'No media updated. Check mediaIds or isTemporary status.',
      );
    }

    return this.mediaModel.find({ _id: { $in: objectIds } });
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const objectId = new Types.ObjectId(mediaId);

    const media = await this.mediaModel.findById(objectId);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.publicId) {
      await this.cloudinaryService.deleteFile(
        media.publicId,
        media.type as 'image' | 'video' | 'raw',
      );
    }

    await this.mediaModel.deleteOne({ _id: objectId });
  }

  async deleteManyMediaByIds(mediaIds: string[]): Promise<void> {
    const medias = await this.mediaModel.find({
      _id: { $in: mediaIds },
    });

    if (medias.length === 0) {
      throw new NotFoundException('Media not found');
    }

    const deletePromises = medias.map((media) => {
      if (media.publicId) {
        return this.cloudinaryService.deleteFile(
          media.publicId,
          media.type as 'image' | 'video' | 'raw',
        );
      }
    });

    const results = await Promise.allSettled(deletePromises);

    results.forEach((result, index) => {
      const publicId = medias[index]?.publicId;
      if (result.status === 'rejected') {
        console.error(`❌ Failed to delete file: ${publicId}`, result.reason);
      } else {
        console.log(`✅ Deleted file: ${publicId}`);
      }
    });

    await this.mediaModel.deleteMany({ _id: { $in: mediaIds } });
  }

  async deleteMediaByPublicId(publicId: string): Promise<void> {
    const media = await this.mediaModel.findOne({
      publicId: publicId,
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    await this.cloudinaryService.deleteFile(
      publicId,
      media.type as 'image' | 'video' | 'raw',
    );
    await this.mediaModel.deleteOne({ _id: media._id });
  }

  async deleteMediasByPublicIds(publicIds: string[]) {
    const medias = await this.mediaModel.find({
      publicId: { $in: publicIds },
    });

    if (medias.length === 0) {
      throw new NotFoundException('Media not found');
    }

    const deletePromises = medias.map((media) => {
      if (media.publicId) {
        return this.cloudinaryService.deleteFile(
          media.publicId,
          media.type as 'image' | 'video' | 'raw',
        );
      }
    });

    const results = await Promise.allSettled(deletePromises);

    results.forEach((result, index) => {
      const publicId = medias[index]?.publicId;
      if (result.status === 'rejected') {
        console.error(`❌ Failed to delete file: ${publicId}`, result.reason);
      } else {
        console.log(`✅ Deleted file: ${publicId}`);
      }
    });

    const mediaIds = medias.map((media) => media._id);

    await this.mediaModel.deleteMany({ _id: { $in: mediaIds } });
  }

  async getAllTemporarayMedia(): Promise<MediaDocument[]> {
    return (
      (await this.mediaModel.find({
        isTemporary: true,
      })) ?? []
    );
  }
}
