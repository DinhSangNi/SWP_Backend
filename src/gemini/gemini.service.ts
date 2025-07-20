import { GenerativeModel } from '@google/generative-ai';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GEMINI_PRO_MODEL, GEMINI_PRO_VISION_MODEL } from './gemini.constant';
import { createContent } from './content.helper';

@Injectable()
export class GeminiService {
  constructor(
    @Inject(GEMINI_PRO_MODEL) private readonly proModel: GenerativeModel,
    @Inject(GEMINI_PRO_VISION_MODEL)
    private readonly proVisionModel: GenerativeModel,
  ) {}

  async generateTextFromMultiModal(
    prompt: string,
    files: Express.Multer.File[],
  ): Promise<{
    totalTokens?: number;
    text: string;
  }> {
    try {
      const contents = createContent(prompt, ...files);

      //   const { totalTokens } = await this.proVisionModel.countTokens({
      //     contents,
      //   });
      const result = await this.proVisionModel.generateContent({ contents });
      const response = result.response;
      const text = response.text();

      return { text };
    } catch (err) {
      if (err instanceof Error) {
        throw new InternalServerErrorException(err.message, err.stack);
      }
      throw err;
    }
  }
}
