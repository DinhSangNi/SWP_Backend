import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop([
    {
      product: { type: Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      thumbnail: { type: String },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ])
  items: {
    product: Types.ObjectId;
    name: string;
    thumbnail?: string;
    price: number;
    quantity: number;
  }[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
