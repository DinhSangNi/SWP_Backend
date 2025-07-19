import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BusinessProfile,
  BusinessProfileDocument,
} from './schemas/business-profile.schema';
import { Model, Types } from 'mongoose';
import { CreateBusinessProfileDto } from './dtos/create-business-profile.dto';
import { MediasService } from 'src/medias/medias.service';
import { MediaTarget } from 'src/medias/types/media.enum';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(BusinessProfile.name)
    private readonly businessProfileModel: Model<BusinessProfileDocument>,
    private readonly mediaService: MediasService,
  ) {}

  async createBusinessProfile(userId: string, dto: CreateBusinessProfileDto) {
    const existed = await this.businessProfileModel.findOne({
      owner: new Types.ObjectId(userId),
    });

    if (existed) {
      throw new ForbiddenException('The business already exists');
    }

    const business = await this.businessProfileModel.create({
      ...dto,
      owner: new Types.ObjectId(userId),
    });

    const medias: string[] = [];

    if (dto.logo) {
      medias.push(dto.logo);
    }
    if (dto.banners && dto.banners.length > 0) {
      medias.push(...dto.banners);
    }

    if (medias.length > 0) {
      await this.mediaService.updateMediaTarget(
        medias,
        MediaTarget.BUSINESS,
        business._id as Types.ObjectId,
      );
    }

    return business;
  }
}
