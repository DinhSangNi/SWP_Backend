import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsArray,
} from 'class-validator';

export class CreateBusinessProfileDto {
  @ApiProperty({ example: 'Cửa hàng ABC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsMongoId({
    each: true,
  })
  @IsOptional()
  banners?: string[];

  @ApiPropertyOptional({ example: '123 Nguyễn Trãi, TP.HCM' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '0312345678' })
  @IsString()
  @IsOptional()
  taxCode?: string;

  @ApiPropertyOptional({ example: 'Chuyên bán đồ điện tử' })
  @IsString()
  @IsOptional()
  description?: string;
}
