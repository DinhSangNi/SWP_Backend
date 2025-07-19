import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MediaTarget, MediaType, MediaUsage } from '../types/media.enum';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  url: string;

  @Prop()
  publicId?: string;

  @Prop({ enum: MediaType, default: MediaType.IMAGE })
  type: string;

  @Prop({ enum: MediaTarget })
  target: MediaTarget;

  @Prop({ type: Types.ObjectId, refPath: 'target' })
  targetId: Types.ObjectId;

  @Prop({ default: true })
  isTemporary: boolean;

  @Prop({ enum: MediaUsage, required: true })
  usage: MediaUsage;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  uploader?: Types.ObjectId;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
