import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    const { refreshToken, ...rest } = await this.authService.register(body);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.status(HttpStatus.CREATED).json({
      message: 'Register successfully',
      metadata: rest,
    });
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const { refreshToken, ...rest } = await this.authService.login(body);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    return res.status(HttpStatus.OK).json({
      message: 'Login successfully',
      metadata: rest,
    });
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Đăng xuất' })
  async logout(@Res() res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return res.status(HttpStatus.OK).json({
      message: 'Logout successfully',
    });
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Refresh access token using refreshToken in cookie',
  })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const sendedRefreshToken = req.cookies?.refreshToken;
    const { refreshToken, accessToken } =
      await this.authService.refreshToken(sendedRefreshToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    return res.status(HttpStatus.OK).json({
      message: 'Refresh token successfully',
      metadata: {
        accessToken,
      },
    });
  }
}
