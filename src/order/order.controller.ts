import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { GetOrderQuery } from './dtos/get-order-query.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    type: CreateOrderDto,
  })
  async create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateOrderDto,
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res.status(HttpStatus.CREATED).json({
      message: 'Create order successfully',
      metadata: (await this.orderService.createOrder(dto, userId)).toObject(),
    });
  }

  @Get(':id')
  async getById(
    @Req() req: { user: { userId: string; role: UserRole } },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;

    return res.status(HttpStatus.OK).json({
      message: `Get order with ${id} successfully`,
      metadata: (
        await this.orderService.getOrderById(id, userId, role)
      ).toObject(),
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(
    @Req() req: { user: { userId: string; role: UserRole } },
    @Query() query: GetOrderQuery,
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    const paginationData = await this.orderService.getMyOrders(userId, query);

    return res.status(HttpStatus.OK).json({
      message: `Get my order successfully`,
      metadata: {
        ...paginationData,
        items: paginationData.items.map((item) => item.toObject()),
      },
    });
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Req() req: { user: { userId: string; role: UserRole } },
    @Param('id') orderId: string,
    @Res() res: Response,
  ) {
    const { userId } = req.user;

    return res.status(HttpStatus.OK).json({
      message: `Cancel order with id: ${orderId} successfully`,
      metadata: await this.orderService.cancelOrder(orderId, userId),
    });
  }
}
