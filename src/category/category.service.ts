import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model, Types } from 'mongoose';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { GetCategoryQueryDto } from './dtos/get-category-query.dto';
import { CategorySortBy } from './types/category.enum';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { PaginationResponse } from 'src/common/dtos/pagination-response.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async getCategories(
    query: GetCategoryQueryDto,
  ): Promise<PaginationResponse<CategoryDocument>> {
    const {
      keyword,
      sortBy = CategorySortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = '1',
      limit = '10',
    } = query;

    const filter: Record<string, any> = {};

    if (keyword) {
      filter.name = { $regex: keyword, $options: 'i' };
    }

    const sortOptions: any = {};
    sortOptions[sortBy ?? CategorySortBy.CREATED_AT] =
      sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      this.categoryModel.countDocuments(filter),
    ]);

    return {
      items: categories,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    };
  }

  async createCategory(
    dto: CreateCategoryDto,
    userId: string,
    role: UserRole,
  ): Promise<CategoryDocument> {
    const existing = await this.categoryModel.findOne({ name: dto.name });
    if (existing) {
      throw new BadRequestException('Category name already exists');
    }

    return await this.categoryModel.create({
      ...dto,
      createdBy: role === UserRole.BUSINESS ? new Types.ObjectId(userId) : null,
    });
  }

  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, dto);

    return await category.save();
  }

  async deleteCategory(categoryId: string) {
    if (!Types.ObjectId.isValid(categoryId))
      throw new BadRequestException('Category id must be ObjectId string');
    const objectId = new Types.ObjectId(categoryId);

    const category = await this.categoryModel.findOne({
      _id: objectId,
    });

    if (!category) throw new NotFoundException(' Category not found');

    await this.categoryModel.deleteOne({
      _id: new Types.ObjectId(categoryId),
    });
  }
}
