import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductsQueryDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm theo tên sản phẩm' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Giá tối thiểu', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Giá tối đa', example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Trang hiện tại', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({
    description: 'Số lượng sản phẩm mỗi trang',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Trường sắp xếp',
    enum: ['price', 'name', 'createdAt'],
  })
  @IsOptional()
  @IsEnum(['price', 'name', 'createdAt'])
  sortBy?: 'price' | 'name' | 'createdAt';

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Lọc theo userId của người đăng' })
  @IsOptional()
  @IsMongoId()
  owner?: string;
}
