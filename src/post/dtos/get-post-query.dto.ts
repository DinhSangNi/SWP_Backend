import { IsOptional, IsEnum, IsString, IsNumberString } from 'class-validator';
import { PostSortBy, PostStatus } from '../types/post.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SortOrder } from 'src/common/enums/sort-order.enum';

export class GetPostsQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo tiêu đề (title)' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Lọc theo status', enum: PostStatus })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ description: 'Lọc theo category ID' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Trường sắp xếp',
    enum: PostSortBy,
  })
  @IsOptional()
  @IsEnum(PostSortBy)
  sortBy?: PostSortBy;

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
