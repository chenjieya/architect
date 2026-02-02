import { Body, Controller, Post, Res } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiQuestionDto } from './dto/aiQuestion.dto';
import type { Response } from 'express';
import { NoNeedToken } from 'src/custom-decorator/custom.decorator';

@Controller('ai')
@NoNeedToken()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('/ask')
  async ask(@Body() params: AiQuestionDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none');

    return await this.aiService.getModel(res, params.question);
  }
}
