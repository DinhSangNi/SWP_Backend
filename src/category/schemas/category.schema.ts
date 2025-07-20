import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ default: null })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
