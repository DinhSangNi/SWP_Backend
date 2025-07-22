import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BusinessProfile,
  BusinessProfileDocument,
} from './schemas/business-profile.schema';
import { Model, Types } from 'mongoose';
import { CreateBusinessProfileDto } from './dtos/create-business-profile.dto';
import { MediasService } from 'src/medias/medias.service';
import { MediaTarget } from 'src/medias/types/media.enum';
import {
  BusinessProfileReviewStatus,
  BusinessProfileStatus,
} from './types/business-profile.enum';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { GetBusinessProfilesQueryDto } from './dtos/get-business-profiles-query.dto';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { PaginationResponse } from 'src/common/dtos/pagination-response.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(BusinessProfile.name)
    private readonly businessProfileModel: Model<BusinessProfileDocument>,
    private readonly mediaService: MediasService,
    private readonly userService: UsersService,
  ) {}

  async createBusinessProfile(userId: string, dto: CreateBusinessProfileDto) {
    const existed = await this.businessProfileModel.findOne({
      owner: new Types.ObjectId(userId),
    });

    if (existed) {
      throw new BadRequestException('The business already exists');
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

  async becomeToBusiness(
    userId: string,
    dto: CreateBusinessProfileDto,
  ): Promise<BusinessProfileDocument> {
    const user = await this.userService.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRole.BUSINESS)
      throw new BadRequestException('User is already a business');

    if (user.role !== UserRole.CUSTOMER)
      throw new BadRequestException('Only customers can become business');

    const businessProfile = await this.createBusinessProfile(userId, dto);

    user.businessProfile = businessProfile._id as Types.ObjectId;
    await user.save();

    return businessProfile;
  }

  async getBussinessProfieById(id: string): Promise<BusinessProfileDocument> {
    const businessProfile = await this.businessProfileModel
      .findById(id)
      .populate('owner', '_id name email');
    if (!businessProfile)
      throw new NotFoundException('Business profile not found');

    return businessProfile;
  }

  async getBussinessProfileByOwnerId(
    ownerId: string,
  ): Promise<BusinessProfileDocument> {
    const businessProfile = await this.businessProfileModel.findOne({
      owner: new Types.ObjectId(ownerId),
    });

    if (!businessProfile)
      throw new NotFoundException('Business profile not found');

    return businessProfile;
  }

  async getBussinessProfiles(
    query: GetBusinessProfilesQueryDto,
  ): Promise<PaginationResponse<BusinessProfileDocument>> {
    const {
      keyword,
      taxCode,
      phone,
      owner,
      status,
      reviewStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const filter: Record<string, any> = {};
    if (keyword) filter.name = { $regex: keyword, $options: 'i' };
    if (taxCode) filter.taxCode = { $regex: taxCode, $options: 'i' };
    if (phone) filter.phone = phone;
    if (owner) filter.owner = owner;
    if (status) filter.status = status;
    if (reviewStatus) filter.reviewStatus = reviewStatus;

    const sortOption: any = { [sortBy]: sortOrder === SortOrder.ASC ? 1 : -1 };

    const [businessProfiles, total] = await Promise.all([
      this.businessProfileModel
        .find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate([
          {
            path: 'owner',
            select: '_id username email fullname',
          },
          {
            path: 'logo',
            select: 'url',
          },
          {
            path: 'banners',
            select: 'url',
          },
        ])
        .exec(),
      this.businessProfileModel.countDocuments(filter),
    ]);

    return {
      items: businessProfiles.map((businessProfile) =>
        businessProfile.toObject(),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateBusinessProfileReviewStatus(
    id: string,
    reviewStatus: BusinessProfileReviewStatus,
  ): Promise<BusinessProfileDocument> {
    const businessProfile = await this.businessProfileModel.findOne({
      _id: new Types.ObjectId(id),
    });

    if (!businessProfile) {
      throw new NotFoundException('Business profile not found');
    }

    if (reviewStatus === BusinessProfileReviewStatus.Approved) {
      businessProfile.status = BusinessProfileStatus.ACTIVE;
      this.userService.updateUserRole(
        businessProfile.owner.toString(),
        UserRole.BUSINESS,
      );
    }

    businessProfile.reviewStatus = reviewStatus;
    return await businessProfile.save();
  }
}
