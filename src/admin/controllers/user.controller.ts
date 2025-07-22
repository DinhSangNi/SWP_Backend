import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { GetUsersQueryDto } from 'src/users/dtos/get-users-query.dto';
import { UsersService } from 'src/users/users.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin/users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  @ApiOperation({ summary: 'Lấy toàn bộ user (có thể filter theo query)' })
  async getUsers(@Query() query: GetUsersQueryDto, @Res() res: Response) {
    const user = await this.userService.getUsers(query);

    return res.status(HttpStatus.OK).json({
      message: 'Get users successfully',
      metadata: user,
    });
  }
}
