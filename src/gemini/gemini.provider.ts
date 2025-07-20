import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Provider } from '@nestjs/common';
import { GEMINI_PRO_MODEL, GEMINI_PRO_VISION_MODEL } from './gemini.constant';
import { ConfigService } from '@nestjs/config';
import { GENERATION_CONFIG, SAFETY_SETTINGS } from './gemini.config';

export const GeminiProModelProvider: Provider<GenerativeModel> = {
  provide: GEMINI_PRO_MODEL,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const genAI = new GoogleGenerativeAI(
      configService.get<string>('GEMINI_API_KEY') as string,
    );
    return genAI.getGenerativeModel({
      model: configService.get<string>('GEMINI_PRO_MODEL') as string,
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });
  },
};

export const GeminiProVisionModelProvider: Provider<GenerativeModel> = {
  provide: GEMINI_PRO_VISION_MODEL,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const genAI = new GoogleGenerativeAI(
      configService.get<string>('GEMINI_API_KEY') as string,
    );
    return genAI.getGenerativeModel({
      model: configService.get<string>('GEMINI_PRO_VISION_MODEL') as string,
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });
  },
};
