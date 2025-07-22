import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { map } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BusinessService } from 'src/business/business.service';
import { GetBusinessProfilesQueryDto } from 'src/business/dtos/get-business-profiles-query.dto';
import { UpdateBusinessProfileReviewStatusDto } from 'src/business/dtos/update-business-profile-review-status.dto';
import { Role } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin/business-profile')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  @ApiOperation({
    summary: 'Lấy tất cả các business profile theo query param',
  })
  @ApiQuery({ type: GetBusinessProfilesQueryDto })
  async getBussinessProfiles(
    @Query() query: GetBusinessProfilesQueryDto,
    @Res() res: Response,
  ) {
    return res.status(HttpStatus.OK).json({
      message: 'Get business profile successfully',
      metadata: await this.businessService.getBussinessProfiles(query),
    });
  }

  @Patch(':id/update-review-status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  @ApiOperation({
    summary:
      'Cập nhật review status của business profile. Cụ thể là approve hay reject. Nếu là approve thì cập nhật user role thành business',
  })
  async updateBusinessProfileReviewStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessProfileReviewStatusDto,
    @Res() res: Response,
  ) {
    return res.status(HttpStatus.OK).json({
      message: "Update business profile's review status successfully",
      metadata: await this.businessService.updateBusinessProfileReviewStatus(
        id,
        dto.reviewStatus,
      ),
    });
  }
}
