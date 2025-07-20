import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { Response } from 'express';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { GetPostsQueryDto } from './dtos/get-post-query.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { fileValidatorPipe } from 'src/gemini/file-validator.pipe';
import { CreatePostIntroduceProductDto } from './dtos/create-post-introduce-product-by-ai.dto';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts(@Query() query: GetPostsQueryDto, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'Get posts successfully',
      metadata: await this.postService.getPosts(query),
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  @ApiBody({
    description: 'Create post',
    type: CreatePostDto,
  })
  async createPost(
    @Req()
    req: {
      user: {
        userId: string;
      };
    },
    @Body() body: CreatePostDto,
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res.status(HttpStatus.CREATED).json({
      message: 'Create post successfully',
      metadata: (await this.postService.createPost(body, userId)).toObject(),
    });
  }

  @Post('introduct-product-by-ai')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  @UseInterceptors(FilesInterceptor('files'))
  async createPostIntroductProductByAI(
    @Req()
    req: {
      user: {
        userId: string;
      };
    },
    @UploadedFiles(fileValidatorPipe) files: Express.Multer.File[],
    @Body() dto: CreatePostIntroduceProductDto,
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res.status(HttpStatus.OK).json({
      message: 'Create post by AI successfully',
      metadata: await this.postService.createPostIntroduceProductByAI(
        userId,
        dto,
        files,
      ),
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  @ApiBody({
    description: 'Update post',
    type: UpdatePostDto,
  })
  async updatePost(
    @Req()
    req: {
      user: {
        userId: string;
        role: UserRole;
      };
    },
    @Param('id') postId: string,
    @Body() body: UpdatePostDto,
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    return res.status(HttpStatus.OK).json({
      message: 'Update post successfully',
      metadata: (
        await this.postService.updatePost(postId, userId, role, body)
      ).toObject(),
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  async deletePost(
    @Req()
    req: {
      user: {
        userId: string;
        role: UserRole;
      };
    },
    @Param('id') postId: string,
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    return res.status(HttpStatus.OK).json({
      message: 'Delete post successfully',
      metadata: await this.postService.deletePost(postId, userId, role),
    });
  }
}
