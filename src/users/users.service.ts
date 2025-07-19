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

    user.role = UserRole.BUSINESS;
    user.businessProfile = businessProfile._id as Types.ObjectId;
    await user.save();

    return user;
  }
}
