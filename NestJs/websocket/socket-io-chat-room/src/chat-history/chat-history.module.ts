import { Module } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ChatHistoryController } from './chat-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatHistory } from 'src/entities/chat-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatHistory])],
  controllers: [ChatHistoryController],
  providers: [ChatHistoryService],
  exports: [ChatHistoryService],
})
export class ChatHistoryModule {}
