import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { UserController } from './controllers/user.controller';
import { BusinessModule } from 'src/business/business.module';
import { BusinessController } from './controllers/business.controller';
import { PostController } from './controllers/post.controller';
import { PostModule } from 'src/post/post.module';
import { OrderModule } from 'src/order/order.module';
import { OrderController } from 'src/order/order.controller';

@Module({
  imports: [UsersModule, BusinessModule, PostModule, OrderModule],
  controllers: [
    UserController,
    BusinessController,
    PostController,
    OrderController,
  ],
})
export class AdminModule {}
