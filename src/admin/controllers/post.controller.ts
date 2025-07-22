import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UpdatePostStatusDto } from 'src/post/dtos/update-post-status';
import { PostService } from 'src/post/post.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post(':id/update-status-post')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('admin')
  @ApiOperation({
    summary: `Cập nhật status của post. (approve, reject)`,
  })
  @ApiBody({
    type: UpdatePostStatusDto,
  })
  async toggleStatusPost(
    @Param('id') postId: string,
    @Body() dto: UpdatePostStatusDto,
    @Res() res: Response,
  ) {
    const data = await this.postService.toggleStatusPost(postId, dto);
    return res.status(HttpStatus.OK).json({
      message: data.message,
      metadata: data.post,
    });
  }
}
