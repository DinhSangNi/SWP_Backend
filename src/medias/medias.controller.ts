import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadMediaDto } from './dtos/UploadMediaDto';
import { MediasService } from './medias.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/decorators/role.decorator';

@ApiTags('Media')
@Controller('medias')
export class MediasController {
  constructor(private readonly mediaService: MediasService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload media',
    type: UploadMediaDto,
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadMediaDto,
    @Req()
    req: {
      user: {
        userId: string;
      };
    },
  ) {
    const { userId } = req.user;
    return this.mediaService.upload(file, body.fileType, userId, body.usage);
  }
}
