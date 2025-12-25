import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { ChatHistoryService } from 'src/chat-history/chat-history.service';
import { CHAT_HISTORY_TYPE_ENUM } from 'src/enum/chat-history';

interface IJoinRoomPayload {
  chatroomId: number;
  userId: number[];
  formId: number;
  formName: string;
}

interface ISendMessagePayload {
  id: number;
  sendUserId: number;
  chatroomId: number;
  message: Message;
}

interface Message {
  type: CHAT_HISTORY_TYPE_ENUM;
  content: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly chatHistoryService: ChatHistoryService,
  ) {}

  @WebSocketServer() service: Server;

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, payload: IJoinRoomPayload) {
    if (!payload.chatroomId || !payload.userId.length) {
      return '用户ID 和 房间ID 不能为空';
    }
    const roomName = payload.chatroomId.toString();

    // 加入到房间
    client.join(roomName);

    const user = await this.userService.findUserByIds(payload.userId);

    // 并向房间所有人发送一条，加入的消息
    this.service.to(roomName).emit('message', {
      type: 'joinRoom',
      userName: user.map((item) => item?.nickName || item?.username),
      userId: payload.userId,
      fromId: payload.formId,
      fromName: payload.formName,
    });
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(@MessageBody() payload: ISendMessagePayload) {
    if (!payload.sendUserId || !payload.chatroomId) {
      return '用户ID 和 房间ID 不能为空';
    }
    const roomName = payload.chatroomId.toString();
    // 保存用户信息
    await this.chatHistoryService.add(+roomName, {
      chatroomId: +roomName,
      senderId: +payload.sendUserId,
      content: payload.message.content,
      type: payload.message.type,
    });

    const user = await this.userService.findUserById(+payload.sendUserId);

    // 向房间内的所有成员发送消息
    this.service.to(roomName).emit('message', {
      type: 'sendMessage',
      id: payload.id,
      userId: payload.sendUserId,
      message: {
        type: payload.message.type,
        content: payload.message.content,
      },
      username: user?.username,
      nickName: user?.nickName,
      headPic: user?.headPic,
    });
  }
}
