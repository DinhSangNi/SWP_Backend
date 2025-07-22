import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BusinessProfileLogAction } from '../types/business-profile-log.enum';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class BusinessProfileLog {
  @Prop({ type: Types.ObjectId, required: true, ref: 'BusinessProfile' })
  businessProfile: Types.ObjectId;

  @Prop({ type: String, enum: BusinessProfileLogAction, required: true })
  action: BusinessProfileLogAction;

  @Prop({ type: String, required: false })
  reason?: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  actedBy: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type BusinessProfileLogDocument = BusinessProfileLog & Document;

export const BusinessProfileLogSchema =
  SchemaFactory.createForClass(BusinessProfileLog);
