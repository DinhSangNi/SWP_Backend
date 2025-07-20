import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  Min,
} from 'class-validator';
import { PostStatus } from '../types/post.enum';

export class CreatePostDto {
  @ApiProperty({ description: 'Tiêu đề bài viết' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Nội dung bài viết' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Danh sách category _id',
    example: ['64b6a72898d23a001ea62fb7', '64b6a72d98d23a001ea62fb9'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Trạng thái bài viết',
    enum: PostStatus,
  })
  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @ApiPropertyOptional({
    description:
      'Mức độ ưu tiên hiển thị bắt đầu từ 0, số càng cao càng ưu tiên',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({
    description: 'ID ảnh thumbnail (media _id)',
    example: '64b6a72d98d23a001ea62fbb',
  })
  @IsMongoId()
  @IsOptional()
  thumbnail?: string;
}
