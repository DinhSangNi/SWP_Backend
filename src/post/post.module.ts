import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { MediasModule } from 'src/medias/medias.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MediasModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
