import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBusinessProfileDto } from 'src/business/dtos/create-business-profile.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('become-business')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Convert customer to business' })
  async becomeBusiness(
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
    const result = await this.userService.becomeBusiness(userId, dto);
    return res.status(HttpStatus.OK).json({
      message: 'Converted to business successfully',
      metadata: result,
    });
  }
}
