import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostStatus } from '../types/post.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdatePostStatusDto {
  @ApiProperty({
    enum: PostStatus,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status: PostStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}
