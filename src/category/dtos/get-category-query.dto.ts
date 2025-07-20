import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { CategorySortBy } from '../types/category.enum';
import { SortOrder } from 'src/common/enums/sort-order.enum';

export class GetCategoryQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên category (name)' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Trường sắp xếp',
    enum: CategorySortBy,
  })
  @IsOptional()
  @IsEnum(CategorySortBy)
  sortBy?: CategorySortBy;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', enum: SortOrder })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ default: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    default: '10',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
