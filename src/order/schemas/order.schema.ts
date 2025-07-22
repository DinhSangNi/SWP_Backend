import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { OrderStatus } from '../types/order.enum';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop([
    {
      product: {
        type: Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: { type: String, required: true },
      thumbnail: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    },
  ])
  items: {
    product: Types.ObjectId;
    name: string;
    thumbnail?: string;
    quantity: number;
    price: number;
  }[];

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop()
  paymentMethod?: string;

  @Prop()
  shippingAddress?: string;

  @Prop()
  paidAt?: Date;

  @Prop()
  shippedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
