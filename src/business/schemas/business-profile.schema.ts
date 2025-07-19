import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/shemas/user.schema';

@Schema({ timestamps: true })
export class BusinessProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  businessName: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media', default: null })
  logo?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media', default: null })
  banner?: Types.ObjectId;

  @Prop()
  businessAddress?: string;

  @Prop()
  taxCode?: string;

  @Prop({ default: false })
  isVerified: boolean;
}

export const BusinessProfileSchema =
  SchemaFactory.createForClass(BusinessProfile);
