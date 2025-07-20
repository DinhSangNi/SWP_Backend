import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import {
  GeminiProModelProvider,
  GeminiProVisionModelProvider,
} from './gemini.provider';

@Module({
  controllers: [GeminiController],
  providers: [
    GeminiService,
    GeminiProModelProvider,
    GeminiProVisionModelProvider,
  ],
  exports: [
    GeminiService,
    GeminiProModelProvider,
    GeminiProVisionModelProvider,
  ],
})
export class GeminiModule {}
