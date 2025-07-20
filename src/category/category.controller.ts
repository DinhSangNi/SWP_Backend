import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
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
import { GetCategoryQueryDto } from './dtos/get-category-query.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getPosts(@Query() query: GetCategoryQueryDto, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'Get categories successfully',
      metadata: await this.categoryService.getCategories(query),
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  @ApiBody({ type: CreateCategoryDto })
  async create(
    @Req() req: { user: { userId: string; role: UserRole } },
    @Body() dto: CreateCategoryDto,
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    return res.status(HttpStatus.CREATED).json({
      message: 'Create category successfully',
      metadata: await this.categoryService.createCategory(dto, userId, role),
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() body: UpdateCategoryDto,
    @Res() res: Response,
  ) {
    return res.status(HttpStatus.OK).json({
      message: 'Update category successfully',
      metadata: await this.categoryService.updateCategory(categoryId, body),
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  async deleteCategory(@Param('id') categoryId: string, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'Delete category successfully',
      metadata: await this.categoryService.deleteCategory(categoryId),
    });
  }
}
