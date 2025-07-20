import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PostStatus } from '../types/post.enum';

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  categories: Types.ObjectId[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ enum: PostStatus, default: PostStatus.PENDING })
  status: PostStatus;

  @Prop({ type: Number, default: 0, min: 0 })
  priority: number;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  thumbnail?: Types.ObjectId;
}

export type PostDocument = Post & Document;
export const PostSchema = SchemaFactory.createForClass(Post);
