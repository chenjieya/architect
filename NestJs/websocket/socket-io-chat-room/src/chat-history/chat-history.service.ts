import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatHistory } from 'src/entities/chat-history.entity';
import { Repository } from 'typeorm';
import { ChatHistoryDto } from './dto/chatHistory.dto';

@Injectable()
export class ChatHistoryService {
  @InjectRepository(ChatHistory)
  private readonly chatHistoryReposity: Repository<ChatHistory>;

  // 添加聊天记录
  async add(chatroomId: number, history: ChatHistoryDto) {
    return await this.chatHistoryReposity.save(history);
  }

  // 查询聊天室所有的聊天记录
  async list(chatroomId: number) {
    return await this.chatHistoryReposity.find({
      where: {
        chatroomId,
      },
      relations: ['sender'],
    });
  }
}
