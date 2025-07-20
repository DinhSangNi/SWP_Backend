import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MediasModule } from './medias/medias.module';
import { BusinessModule } from './business/business.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) => {
        return {
          uri: ConfigService.get<string>('MONGO_URI'),
        };
      },
    }),
    AuthModule,
    UsersModule,
    MediasModule,
    BusinessModule,
    CloudinaryModule,
    ProductsModule,
    CategoryModule,
    PostModule,
  ],
  providers: [AppService],
})
export class AppModule {}
