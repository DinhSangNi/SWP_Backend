import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
  UseGuards,
  Res,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UploadMediaDto } from './dtos/upload-media.dto';
import { MediasService } from './medias.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { Response } from 'express';

@ApiTags('Medias')
@ApiBearerAuth()
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
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res.status(HttpStatus.OK).json({
      message: 'Upload media successfully',
      metadata: (
        await this.mediaService.upload(file, body.fileType, userId, body.usage)
      ).toObject(),
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một media' })
  async deleteMedia(@Param('id') id: string, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'Delete media successfully',
      metadata: await this.mediaService.deleteMedia(id),
    });
  }
}
