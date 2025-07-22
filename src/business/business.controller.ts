import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { BusinessService } from './business.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBusinessProfileDto } from './dtos/create-business-profile.dto';
import { Response } from 'express';

@ApiTags('Business-Profile')
@ApiBearerAuth()
@Controller('business-profile')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
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
