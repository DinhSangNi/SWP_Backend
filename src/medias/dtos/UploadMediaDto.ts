import { ApiProperty } from '@nestjs/swagger';
import { MediaType, MediaUsage } from '../types/media.enum';

export class UploadMediaDto {
  @ApiProperty({
    enum: MediaType,
    description: 'Loại media',
    example: MediaType.IMAGE,
  })
  fileType: MediaType;

  @ApiProperty({
    enum: MediaUsage,
    description: 'Mục đích sử dụng media',
    required: false,
    example: MediaUsage.PRODUCT_GALLERY,
  })
  usage?: MediaUsage;
}
