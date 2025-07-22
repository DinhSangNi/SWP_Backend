import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateCartDto } from './dtos/create-cart.dto';
import { Response } from 'express';
import { UpdateCartDto } from './dtos/update.cart.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create user cart (merge items)' })
  @ApiBody({ type: CreateCartDto })
  async create(
    @Req()
    req: {
      user: {
        userId: string;
      };
    },
    @Body() body: CreateCartDto,
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res.status(HttpStatus.CREATED).json({
      message: 'Create cart successfully',
      metadata: await this.cartService.createCart(userId, body),
    });
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'update user cart (merge items)' })
  @ApiBody({ type: UpdateCartDto })
  async update(
    @Req()
    req: {
      user: {
        userId: string;
      };
    },
    @Body() body: UpdateCartDto,
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res.status(HttpStatus.OK).json({
      message: 'Update cart successfully',
      metadata: await this.cartService.updateCart(userId, body),
    });
  }
}
