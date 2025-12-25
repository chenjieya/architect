import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Post('list')
  @UseInterceptors(ClassSerializerInterceptor)
  async getHistoryList(
    @Query('chatroomId', ParseIntPipe) chatroomId: number,
    @Body() cursorDto: CursorPaginationDto,
  ) {
    return await this.chatHistoryService.list(chatroomId, cursorDto);
  }
}
