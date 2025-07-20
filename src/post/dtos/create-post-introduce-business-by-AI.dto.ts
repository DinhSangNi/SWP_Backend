import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostIntroduceBusinessByAIDto {
  @ApiProperty({
    description: 'Mô tả ngắn gọn doanh nghiệp cung cáp những gì',
    example:
      'Cung cấp quần áo, phụ kiện thời trang thiết kế độc quyền, tư vấn phong cách cá nhân',
  })
  @IsString()
  services: string;
}
