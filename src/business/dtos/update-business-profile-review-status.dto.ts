import { IsEnum } from 'class-validator';
import { BusinessProfileReviewStatus } from '../types/business-profile.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBusinessProfileReviewStatusDto {
  @ApiProperty({
    enum: BusinessProfileReviewStatus,
    example: BusinessProfileReviewStatus.Approved,
  })
  @IsEnum(BusinessProfileReviewStatus)
  reviewStatus: BusinessProfileReviewStatus;
}
