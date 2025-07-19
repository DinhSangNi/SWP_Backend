import { ApiProperty } from '@nestjs/swagger';
import { MediaType, MediaUsage } from '../types/media.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UploadMediaDto {
  @ApiProperty({
    enum: MediaType,
    description: 'Loại media',
    example: MediaType.IMAGE,
  })
  @IsEnum(MediaType)
  fileType: MediaType;

  @ApiProperty({
    enum: MediaUsage,
    description: 'Mục đích sử dụng media',
    required: false,
    example: MediaUsage.PRODUCT_GALLERY,
  })
  @IsOptional()
  @IsEnum(MediaUsage)
  usage?: MediaUsage;
}
