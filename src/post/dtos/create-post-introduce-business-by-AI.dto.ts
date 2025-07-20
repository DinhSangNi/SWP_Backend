import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostIntroduceBusinessByAIDto {
  @ApiProperty()
  @IsString()
  products: string;
}
