import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { GenerateTextDto } from './dto/generate-text.dto';
import { fileValidatorPipe } from './file-validator.pipe';
import { Response } from 'express';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('text-and-image')
  @UseInterceptors(FilesInterceptor('files'))
  async generateTextFromMultiModal(
    @Body() dto: GenerateTextDto,
    @UploadedFiles(fileValidatorPipe)
    files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    return res.status(HttpStatus.OK).json({
      message: 'Generate poem from image successfully',
      metadata: await this.geminiService.generateTextFromMultiModal(
        dto.prompt,
        files,
      ),
    });
  }
}
