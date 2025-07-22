import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: null })
  salePrice?: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media', default: null })
  thumbnail: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Media', default: [] })
  images: Types.ObjectId[];

  @Prop({ default: true })
  isPublish: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
