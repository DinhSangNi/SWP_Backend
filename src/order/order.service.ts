import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { GetOrderQuery } from './dtos/get-order-query.dto';
import { OrderSortBy } from './types/order.enum';
import { PaginationResponse } from 'src/common/dtos/pagination-response.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getOrderById(
    orderId: string,
    userId: string,
    role: string,
  ): Promise<OrderDocument> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('user', '-password')
      .populate('items.product');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.toString() !== userId && role !== UserRole.ADMIN)
      throw new ForbiddenException("Don't have permission to get order");

    return order;
  }

  async getMyOrders(
    userId: string,
    query: GetOrderQuery,
  ): Promise<PaginationResponse<OrderDocument>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = { user: userId };
    if (query.status) {
      filter.status = query.status;
    }

    const sortOptions: any = {};
    sortOptions[query.sortBy ?? OrderSortBy.CREATED_AT] =
      query.sortOrder === 'asc' ? 1 : -1;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name price thumbnail')
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      items: orders.map((order) => order.toObject()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createOrder(
    dto: CreateOrderDto,
    userId: string,
  ): Promise<OrderDocument> {
    const populatedItems: any[] = [];

    let totalPrice = 0;

    for (const item of dto.items) {
      const product = await this.productModel.findById(item.product);
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.product}`);
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      populatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const created = new this.orderModel({
      user: new Types.ObjectId(userId),
      items: populatedItems,
      totalPrice,
      paymentMethod: dto.paymentMethod,
      shippingAddress: dto.shippingAddress,
    });

    return await created.save();
  }
}
