import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';

@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Get('list')
  @UseInterceptors(ClassSerializerInterceptor)
  async getHistoryList(@Query('chatroomId', ParseIntPipe) chatroomId: number) {
    return await this.chatHistoryService.list(chatroomId);
  }
}
