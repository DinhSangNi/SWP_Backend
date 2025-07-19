import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/shemas/user.schema';

export type BusinessProfileDocument = Document & BusinessProfile;
@Schema({ timestamps: true })
export class BusinessProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  owner: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media', default: null })
  logo?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Media', default: null })
  banners?: Types.ObjectId[];

  @Prop()
  address?: string;

  @Prop()
  taxCode?: string;

  @Prop({ default: false })
  isVerified: boolean;
}

export const BusinessProfileSchema =
  SchemaFactory.createForClass(BusinessProfile);
