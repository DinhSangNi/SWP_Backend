import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Model, Types } from 'mongoose';
import { CartItemDto, CreateCartDto } from './dtos/create-cart.dto';
import { mergeCartItems } from 'src/common/utils/cart.util';
import { UpdateCartDto } from './dtos/update.cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  //   async createCart(dto: CreateCartDto, userId: string): Promise<Cart> {
  //     const existing = await this.cartModel.findOne({
  //       user: new Types.ObjectId(userId),
  //     });

  //     type NormalizedCartItem = Omit<CartItemDto, 'product'> & {
  //       product: Types.ObjectId;
  //     };

  //     if (existing) {
  //       existing.items = mergeCartItems(existing.items, dto.items).map(
  //         (item: NormalizedCartItem) => {
  //           return {
  //             ...item,
  //             product: Types.ObjectId.isValid(item.product)
  //               ? item.product
  //               : new Types.ObjectId(item.product),
  //           };
  //         },
  //       );
  //       return existing.save();
  //     }

  //     const created = new this.cartModel({
  //       user: new Types.ObjectId(userId),
  //       items: dto.items.map((item) => ({
  //         ...item,
  //         product: new Types.ObjectId(item.product),
  //       })),
  //     });

  //     return created.save();
  //   }

  async createCart(userId: string, dto: CreateCartDto) {
    const { items } = dto;
    const objectId = new Types.ObjectId(userId);
    const normalizeItems = items.map((item) => ({
      ...items,
      product: Types.ObjectId.isValid(item.product)
        ? item.product
        : new Types.ObjectId(item.product),
    }));
    const existing = await this.cartModel.findOne({
      user: objectId,
    });
    if (existing) throw new BadRequestException('Cart already exists');
    return this.cartModel.create({ user: objectId, ...normalizeItems });
  }

  async updateCart(userId: string, dto: UpdateCartDto) {
    const objectId = new Types.ObjectId(userId);
    const existing = await this.cartModel.findOne({ user: objectId });
    if (!existing) throw new NotFoundException('Cart not found');
    const { items } = dto;
    type NormalizedCartItem = Omit<CartItemDto, 'product'> & {
      product: Types.ObjectId;
    };
    existing.items = mergeCartItems(existing.items, items!).map(
      (item: NormalizedCartItem) => {
        return {
          ...item,
          product: Types.ObjectId.isValid(item.product)
            ? item.product
            : new Types.ObjectId(item.product),
        };
      },
    );
    return existing.save();
  }
}
