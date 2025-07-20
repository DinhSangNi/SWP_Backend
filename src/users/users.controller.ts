import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
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
import { Role } from 'src/common/decorators/role.decorator';
import { GetUsersQueryDto } from './dtos/get-users-query.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy toàn bộ user (có thể filter theo query)' })
  async getUsers(@Query() query: GetUsersQueryDto, @Res() res: Response) {
    const user = await this.userService.getUsers(query);

    return res.status(HttpStatus.OK).json({
      message: 'Get users successfully',
      metadata: user,
    });
  }

  @Post('become-business')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chuyển customer sang business' })
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

  @Post(':userId/verify-business')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  @ApiOperation({ summary: 'Verify business profile của user' })
  async verifyBusinessProfile(
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const user = await this.userService.verifyUserToBusiness(userId);

    return res.status(HttpStatus.OK).json({
      message: 'Business profile verified successfully',
      metadata: user,
    });
  }
}
