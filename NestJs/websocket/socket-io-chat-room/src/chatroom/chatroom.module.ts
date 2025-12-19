import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { ChatroomController } from './chatroom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { FriendShipModule } from 'src/friend-ship/friend-ship.module';
import { UserChatroom } from 'src/entities/user-chatroom.entity';
import { Chatroom } from 'src/entities/chatroom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserChatroom, Chatroom]),
    FriendShipModule,
  ],
  controllers: [ChatroomController],
  providers: [ChatroomService],
})
export class ChatroomModule {}
