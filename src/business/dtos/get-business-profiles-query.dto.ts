import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsMongoId,
} from 'class-validator';
import {
  BusinessProfileStatus,
  BusinessProfileReviewStatus,
} from '../types/business-profile.enum';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { Type } from 'class-transformer';

export class GetBusinessProfilesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  owner?: string;

  @ApiPropertyOptional({ enum: BusinessProfileStatus })
  @IsOptional()
  @IsEnum(BusinessProfileStatus)
  status?: BusinessProfileStatus;

  @ApiPropertyOptional({ enum: BusinessProfileReviewStatus })
  @IsOptional()
  @IsEnum(BusinessProfileReviewStatus)
  reviewStatus?: BusinessProfileReviewStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
