import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID của category',
    example: '60f1c2a7e3a1234567890abc',
  })
  category: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  images?: string[];
}
