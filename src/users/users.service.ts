import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './shemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateBusinessProfileDto } from 'src/business/dtos/create-business-profile.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { BusinessService } from 'src/business/business.service';
import { GetUsersQueryDto } from './dtos/get-users-query.dto';
import { UserSortBy } from './types/user.enum';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { PaginationResponse } from 'src/common/dtos/pagination-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly businessService: BusinessService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserDocument> {
    const { email, password, username, fullname } = dto;

    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = new this.userModel({
      email,
      password: hashedPassword,
      username,
      fullname,
    });

    return await createdUser.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findOne({ _id: id });
  }

  async becomeBusiness(
    userId: string,
    dto: CreateBusinessProfileDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);

    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.BUSINESS)
      throw new BadRequestException('User is already a business');

    if (user.role !== UserRole.CUSTOMER)
      throw new BadRequestException('Only customers can become business');

    const businessProfile = await this.businessService.createBusinessProfile(
      userId,
      dto,
    );

    // user.role = UserRole.BUSINESS;
    user.businessProfile = businessProfile._id as Types.ObjectId;
    await user.save();

    return user;
  }

  async verifyUserToBusiness(userId: string) {
    const user = await this.userModel
      .findOne({
        _id: new Types.ObjectId(userId),
      })
      .populate('businessProfile');

    if (!user) throw new NotFoundException('User not found');
    if (!user.businessProfile)
      throw new BadRequestException("User don't have business profile");

    await this.businessService.verifyBusinessProfile(
      user.businessProfile.toString(),
    );

    user.role = UserRole.BUSINESS;

    return await user.save();
  }

  async getUsers(
    query: GetUsersQueryDto,
  ): Promise<PaginationResponse<UserDocument>> {
    const {
      page = 1,
      limit = 10,
      role,
      sortBy = UserSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
    } = query;

    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (role) {
      filter.role = role;
    }

    const users = await this.userModel
      .find(filter)
      .populate('businessProfile')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.userModel.countDocuments(filter);

    return {
      items: users,
      total,
      totalPages: Math.ceil(total / limit),
      page: page,
      limit: limit,
    };
  }
}
