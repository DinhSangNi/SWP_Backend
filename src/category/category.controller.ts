import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/decorators/role.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  @ApiBody({ type: CreateCategoryDto })
  async create(@Body() dto: CreateCategoryDto, @Res() res: Response) {
    return res.status(HttpStatus.CREATED).json({
      message: 'Create category successfully',
      metadata: await this.categoryService.createCategory(dto),
    });
  }
}
