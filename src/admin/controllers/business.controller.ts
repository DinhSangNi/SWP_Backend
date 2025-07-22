import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BusinessService } from 'src/business/business.service';
import { UpdateBusinessProfileReviewStatusDto } from 'src/business/dtos/update-business-profile-review-status.dto';
import { Role } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin/business-profile')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

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
