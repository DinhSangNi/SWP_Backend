import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { GetOrderQuery } from './dtos/get-order-query.dto';
import { OrderSortBy, OrderStatus } from './types/order.enum';
import { PaginationResponse } from 'src/common/dtos/pagination-response.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
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
      .populate('user', '-password');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.toString() !== userId && role !== UserRole.ADMIN)
      throw new ForbiddenException("Don't have permission to get this order");

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
    session?: ClientSession,
  ): Promise<OrderDocument> {
    let localSession: ClientSession | null = null;

    if (!session) {
      localSession = await this.connection.startSession();
      localSession.startTransaction();
    } else {
      localSession = session;
    }

    try {
      const populatedItems: any[] = [];
      let totalPrice = 0;

      for (const item of dto.items) {
        const product = await this.productModel
          .findById(item.product)
          .populate<{ thumbnail: { url: string } }>([
            {
              path: 'thumbnail',
              select: 'url',
            },
          ])
          .session(localSession);

        if (!product) {
          throw new NotFoundException(`Product not found: ${item.product}`);
        }

        if (item.quantity <= 0) {
          throw new BadRequestException('Quantity must be greater than 0');
        }

        if (item.quantity > product.quantity) {
          throw new BadRequestException(
            `Not enough stock for product: ${product.name}`,
          );
        }

        const updated = await this.productModel.findOneAndUpdate(
          { _id: product._id, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { new: true, session: localSession },
        );

        if (!updated) {
          throw new BadRequestException(
            `Not enough stock for product: ${product.name}`,
          );
        }

        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;

        populatedItems.push({
          product: product._id,
          name: product.name,
          thumbnail: product.thumbnail?.url ?? null,
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

      const savedOrder = await created.save({ session: localSession });

      if (!session && localSession) {
        await localSession.commitTransaction();
      }

      return savedOrder;
    } catch (error) {
      if (!session && localSession) {
        await localSession.abortTransaction();
      }
      throw error;
    } finally {
      if (!session && localSession) {
        await localSession.endSession();
      }
    }
  }

  async cancelOrder(
    orderId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<OrderDocument> {
    let localSession: ClientSession | null = null;

    if (!session) {
      localSession = await this.connection.startSession();
      localSession.startTransaction();
    } else {
      localSession = session;
    }

    try {
      const order = await this.orderModel
        .findOne({
          _id: new Types.ObjectId(orderId),
          user: new Types.ObjectId(userId),
        })
        .session(localSession);

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (![OrderStatus.PENDING].includes(order.status)) {
        throw new BadRequestException(
          'Order cannot be canceled in current status',
        );
      }

      for (const item of order.items) {
        const product = await this.productModel
          .findById(item.product)
          .session(localSession);
        if (product) {
          product.quantity += item.quantity;
          await product.save({ session: localSession });
        }
      }

      order.status = OrderStatus.CANCELLED;
      await order.save({ session: localSession });

      if (!session) {
        await localSession.commitTransaction();
      }

      return order;
    } catch (error) {
      if (!session) {
        await localSession.abortTransaction();
      }
      throw error;
    } finally {
      if (!session && localSession) {
        await localSession.endSession();
      }
    }
  }
}
