import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UserModule } from 'src/user/user.module';
import { ChatHistoryModule } from 'src/chat-history/chat-history.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, ChatHistoryModule, AuthModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
