import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBusinessProfileDto } from './dtos/create-business-profile.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/decorators/role.decorator';

@ApiTags('Business-Profile')
@ApiBearerAuth()
@Controller('business-profile')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  @ApiOperation({ summary: 'Lấy business profile theo id' })
  async getBussinessProfileById(@Param('id') id: string, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: `Get business profile with id: ${id} successfully`,
      metadata: (
        await this.businessService.getBussinessProfieById(id)
      ).toObject(),
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('customer')
  @ApiOperation({ summary: 'Tạo business profile' })
  @ApiBody({
    type: CreateBusinessProfileDto,
  })
  async becomeToBusiness(
    @Req()
    req: {
      user: {
        userId: string;
      };
    },
    @Body() dto: CreateBusinessProfileDto,
    @Res() res: Response,
  ) {
    const { userId } = req.user;

    return res.status(HttpStatus.CREATED).json({
      message: 'Create business profile successfully',
      metadata: (
        await this.businessService.becomeToBusiness(userId, dto)
      ).toObject(),
    });
  }
}
