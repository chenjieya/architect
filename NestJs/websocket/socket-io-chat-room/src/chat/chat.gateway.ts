import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { ChatHistoryService } from 'src/chat-history/chat-history.service';
import { CHAT_HISTORY_TYPE_ENUM } from 'src/enum/chat-history';
import { BadGatewayException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { OnEvent } from '@nestjs/event-emitter';

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
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly chatHistoryService: ChatHistoryService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer() service: Server;
  private userSocketIdMap: Map<number, Set<string>> = new Map();

  handleConnection(client: Socket) {
    try {
      const { token } = client.handshake.auth;
      if (!token) {
        throw new BadGatewayException('没有token');
      }

      // 解析token
      const user = this.authService.verferJwtToken(token);
      if (!user?.id) {
        console.log('用户id不存在');
        throw new BadGatewayException('没有token');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      client.data.userId = user.id;

      if (!this.userSocketIdMap.has(user.id)) {
        this.userSocketIdMap.set(user.id, new Set([]));
      }

      this.userSocketIdMap.get(user.id)!.add(client.id);
      console.log(this.userSocketIdMap, 'map-connection', user.id);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = client.data.userId;
    if (!userId) return;

    const socketIds = this.userSocketIdMap.get(userId);
    socketIds?.delete(client.id);

    if (socketIds && socketIds.size === 0) {
      this.userSocketIdMap.delete(userId);
    }

    console.log('socket disconnected', client.id);
    console.log(this.userSocketIdMap, 'map-disconnect');
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, payload: IJoinRoomPayload) {
    console.log(payload, 'joinROom');
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
      chatroomId: +roomName,
      username: user?.username,
      nickName: user?.nickName,
      headPic: user?.headPic,
    });
  }

  // 断开链接之后重新加入所有的房间
  @SubscribeMessage('rejoinRooms')
  rejoinRooms(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatroomIds: number[] },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = client.data.userId;
    if (!userId) return;
    payload.chatroomIds.forEach((chatroomId) => {
      // 重新加入到之前的所有房间中
      client.join(chatroomId.toString());
    });

    console.log(client.rooms, 'rooms');
  }

  @OnEvent('chatroom.created')
  handleCreateRoom(payload: { chatroomId: number; memberIds: number[] }) {
    payload.memberIds.forEach((userId) => {
      const socketIds = this.userSocketIdMap.get(userId);
      socketIds?.forEach((socketId) => {
        // 通知所有用户 的socket 房间已经创建了
        this.service.to(socketId).emit('chatroomCreated', {
          chatroomId: payload.chatroomId,
          memberIds: payload.memberIds,
        });
      });
    });
  }

  @OnEvent('send.request')
  sendFriendRequest(payload: { toUserId: number; fromUserId: number }) {
    const socketIds = this.userSocketIdMap.get(payload.toUserId);

    socketIds?.forEach((socketId) => {
      this.service.to(socketId).emit('friendRequest', {
        toUserId: payload.toUserId,
        fromUserId: payload.fromUserId,
      });
    });
  }

  // 用户注册之后默认加入到官方群聊， 通知所有用户刷新官方好友列表
  @OnEvent('chatroom.refresh')
  registerUserRefershGuanFangFriendList() {
    for (const [, socketIds] of this.userSocketIdMap) {
      socketIds.forEach((socketId) => {
        this.service.to(socketId).emit('userRegister');
      });
    }
  }
}
