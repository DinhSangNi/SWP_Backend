import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dtos/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async createCategory(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const existing = await this.categoryModel.findOne({ name: dto.name });
    if (existing) {
      throw new BadRequestException('Category name already exists');
    }

    return await this.categoryModel.create(dto);
  }
}
