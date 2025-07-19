import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from 'src/common/enums/user-role.enum';

export type UserDocument = Document & User;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  fullname?: string;

  @Prop({ default: UserRole.CUSTOMER, enum: UserRole })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Media', default: null })
  avatar?: Types.ObjectId;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop({ type: Types.ObjectId, ref: 'BusinessProfile', default: null })
  businessProfile?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
