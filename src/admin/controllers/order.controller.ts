import { Controller } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';

@Controller('admin/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
}
