import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BusinessProfileStatus } from '../types/business-profile.enum';

export type BusinessProfileDocument = Document & BusinessProfile;
@Schema({ timestamps: true })
export class BusinessProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media', default: null })
  logo?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Media', default: null })
  banners?: Types.ObjectId[];

  @Prop({ default: null })
  address?: string;

  @Prop({ min: 10, max: 10 })
  phone: string;

  @Prop({ default: null })
  taxCode?: string;

  @Prop({ default: null })
  verifiedAt: Date;

  @Prop({
    enum: BusinessProfileStatus,
    default: BusinessProfileStatus.INACTIVE,
  })
  status: BusinessProfileStatus;
}

export const BusinessProfileSchema =
  SchemaFactory.createForClass(BusinessProfile);
