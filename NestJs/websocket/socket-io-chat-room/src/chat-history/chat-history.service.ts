import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatHistory } from 'src/entities/chat-history.entity';
import { Repository } from 'typeorm';
import { ChatHistoryDto } from './dto/chatHistory.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

@Injectable()
export class ChatHistoryService {
  @InjectRepository(ChatHistory)
  private readonly chatHistoryReposity: Repository<ChatHistory>;

  // 添加聊天记录
  async add(chatroomId: number, history: ChatHistoryDto) {
    return await this.chatHistoryReposity.save(history);
  }

  // 查询聊天室所有的聊天记录
  async list(chatroomId: number, cursorDto: CursorPaginationDto) {
    // 游标分页：需要参数： chatroomId, cursor, limit
    // 返回参数： chatroomId, hasMore, data[], nextCursor

    // 1. 根据cursor limit chatroomId 查询数据(倒叙，时间最新的在前面)
    const queryBuilder = this.chatHistoryReposity
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.sender', 'sender')
      .where('history.chatroomId  = :chatroomId', { chatroomId })
      .orderBy('history.id', 'DESC')
      .take(cursorDto.limit + 1); // 多查询一条，判断是否是最后一页

    if (cursorDto.cursor) {
      queryBuilder.andWhere('history.id < :id', { id: cursorDto.cursor });
    }

    let hasMore = false;
    let nextCursor: number | null = null;
    // 2. 查询数据后，判断是否还有更多数据
    const data = await queryBuilder.getMany();

    // 查询出来的数据长度 大于 需要查询的长度，说明有多余的数据
    if (data.length > cursorDto.limit) {
      hasMore = true;
      // 删除多余的最后一条
      data.pop();
      nextCursor = data[data.length - 1].id;
    }

    // 3. 返回数据和下一页的游标
    return {
      data,
      hasMore,
      nextCursor,
    };
  }
}
