---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. 引言

在现代 Web 应用中，实时通信功能变得越来越重要。无论是聊天应用、实时协作工具还是实时数据监控，WebSocket 技术都扮演着关键角色。NestJS 作为 Node.js 的渐进式框架，提供了优雅且强大的 WebSocket 实现方案。本文将深入探讨 NestJS 中 WebSocket 的完整使用方法，涵盖从基础连接到高级功能的方方面面。

## 2. WebSocket 模块安装与配置

### 2.1 安装依赖

首先，我们需要安装必要的包：

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io
npm install -D @types/socket.io
```

### 2.2 基础模块配置

创建一个 WebSocket 网关模块：

```typescript
// websocket.module.ts
import { Module } from "@nestjs/common";
import { WebSocketGateway } from "./websocket.gateway";

@Module({
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
```

## 3. 核心网关（Gateway）实现

### 3.1 基础网关结构

```typescript
// websocket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: "*", // 生产环境应配置具体的域名
    credentials: true,
  },
  namespace: "/chat", // 命名空间
  transports: ["websocket", "polling"], // 传输方式
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("WebSocketGateway");
  private users: Map<string, any> = new Map(); // 用户映射表
  private rooms: Map<string, Set<string>> = new Map(); // 房间管理

  // 初始化后执行
  afterInit(server: Server) {
    this.logger.log("WebSocket Server Initialized");

    // 设置中间件
    server.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token;
      // 这里可以添加认证逻辑
      next();
    });
  }

  // 处理客户端连接
  handleConnection(client: Socket) {
    const clientId = client.id;
    const username = client.handshake.query.username as string;

    this.users.set(clientId, {
      id: clientId,
      username: username || `user_${clientId.slice(0, 8)}`,
      connectedAt: new Date(),
      rooms: new Set(),
    });

    this.logger.log(`Client connected: ${clientId}`);
    this.server.emit("user-connected", {
      userId: clientId,
      username: this.users.get(clientId).username,
      timestamp: new Date(),
      onlineUsers: this.users.size,
    });
  }

  // 处理客户端断开连接
  handleDisconnect(client: Socket) {
    const clientId = client.id;
    const user = this.users.get(clientId);

    if (user) {
      // 离开所有房间
      user.rooms.forEach((room) => {
        this.handleLeaveRoom(client, room);
      });

      this.users.delete(clientId);
      this.logger.log(`Client disconnected: ${clientId}`);

      this.server.emit("user-disconnected", {
        userId: clientId,
        username: user.username,
        timestamp: new Date(),
        onlineUsers: this.users.size,
      });
    }
  }
}
```

## 4. 消息处理器详解

### 4.1 参数接收的两种方式详解

在 NestJS WebSocket 中，处理消息时有两种主要的参数接收方式：

#### 4.1.1 **显式参数接收（推荐用于简单场景）**

```typescript
@SubscribeMessage('joinRoom')
joinRoom(client: Socket, payload: any): void {
  // client: 自动注入的Socket对象，代表当前客户端连接
  // payload: 客户端发送的消息数据
  console.log(payload.roomName);
  client.join(payload.roomName);
  this.server.to(payload.roomName).emit('message', {
    nickName: payload.nickName,
    message: `${payload.nickName} 加入了 ${payload.roomName} 房间`
  });
}
```

#### 4.1.2 **装饰器方式接收（推荐用于复杂场景）**

```typescript
@SubscribeMessage('sendMessage')
sendMessage(
  @MessageBody() payload: any,          // 使用装饰器提取消息体
  @ConnectedSocket() client: Socket     // 使用装饰器获取Socket连接
): void {
  console.log(payload);
  this.server.to(payload.room).emit('message', {
    nickName: payload.nickName,
    message: payload.message
  });
}
```

#### 4.1.3 **两种方式的对比：**

| 特性           | 显式参数接收           | 装饰器方式接收               |
| -------------- | ---------------------- | ---------------------------- |
| **参数顺序**   | 固定：`(client, data)` | 灵活，可任意顺序             |
| **代码简洁性** | 更简洁                 | 需要更多装饰器               |
| **可读性**     | 直观，但不够自描述     | 明确，自描述性强             |
| **类型安全**   | 需要手动指定类型       | 装饰器支持类型推断           |
| **适用场景**   | 简单消息处理           | 复杂处理器，需要明确参数来源 |

### 4.2 核心对象区别：@ConnectedSocket() Socket vs @WebSocketServer() Server

这是一个非常重要的概念区别，理解这两个对象的差异对于正确使用 WebSocket 至关重要：

#### 4.2.1 **@ConnectedSocket() - 单个客户端连接**

```typescript
@SubscribeMessage('message')
handleMessage(@ConnectedSocket() client: Socket) {
  // client 代表当前发送消息的这个特定客户端
  console.log('客户端ID:', client.id); // 如：'abc123'
  console.log('客户端地址:', client.handshake.address); // 如：'192.168.1.100'

  // 只能操作这个特定的客户端
  client.emit('private', '只发给你'); // 单播
  client.join('room1'); // 这个客户端加入房间
}
```

**特点：**

- 每次调用对应一个**特定的客户端连接**
- 不同的客户端有不同的 `Socket` 实例
- 用于操作特定客户端（单播、离开房间等）

#### 4.2.2 **@WebSocketServer() - 整个 WebSocket 服务器**

```typescript
@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server; // 整个WebSocket服务器

  @SubscribeMessage("message")
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    // server 可以操作所有连接
    this.server.emit("broadcast", "发给所有人"); // 广播给所有客户端

    // 也可以操作特定房间
    this.server.to("room1").emit("roomMessage", "发给room1所有人");
  }
}
```

**特点：**

- **全局唯一**，整个应用只有一个
- 用于广播、房间管理、获取所有连接等
- 是 `Socket.IO` 的 `Server` 实例

#### 4.2.3 **关键区别总结：**

| 特性         | @ConnectedSocket() Socket        | @WebSocketServer() Server    |
| ------------ | -------------------------------- | ---------------------------- |
| **作用范围** | 单个客户端连接                   | 整个 WebSocket 服务器        |
| **实例数量** | 每个连接一个实例                 | 全局单例                     |
| **主要用途** | 单播、客户端操作                 | 广播、房间管理               |
| **地址**     | 每个客户端地址不同               | 服务器地址，对所有客户端一样 |
| **典型操作** | `.emit()`, `.join()`, `.leave()` | `.to().emit()`, `.sockets`   |

#### 4.2.4 **关系示意图：**

```
                              WebSocket Server (单例)
                                     ↑
                                     │ @WebSocketServer()
                                     │
                              +-------------------+
                              |   ChatGateway     |
                              +-------------------+
                                     │
                                     │ 管理
                                     ↓
                        +-------------------------+
                        |   Connected Sockets     |
                        +-------------------------+
                        |                         |
                +------------+           +------------+
                |  Client A  |           |  Client B  |
                | (Socket)   |           | (Socket)   |
                | id: abc123 |           | id: def456 |
                | IP: 1.1.1.1|           | IP: 2.2.2.2|
                +------------+           +------------+
```

### 4.3 基础消息处理

```typescript
// 继续在 websocket.gateway.ts 中添加

@WebSocketGateway()
export class WebSocketGateway {
  // ... 之前的代码

  // 处理文本消息 - 使用显式参数方式
  @SubscribeMessage("message")
  handleMessage(client: Socket, payload: any): void {
    const user = this.users.get(client.id);
    const messageData = {
      id: this.generateMessageId(),
      sender: {
        id: client.id,
        username: user.username,
      },
      content: payload.content,
      timestamp: new Date(),
      type: "text",
      room: payload.room || "general",
    };

    // 发送给特定房间或所有人
    if (payload.room) {
      this.server.to(payload.room).emit("message", messageData);
    } else {
      this.server.emit("message", messageData);
    }

    // 消息确认 - 使用client单播
    client.emit("message-delivered", {
      messageId: messageData.id,
      timestamp: new Date(),
    });
  }

  // 处理私聊消息 - 使用装饰器方式
  @SubscribeMessage("private-message")
  handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    const { recipientId, content } = payload;
    const sender = this.users.get(client.id);

    // 通过server找到目标客户端
    const recipientSocket = this.server.sockets.sockets.get(recipientId);

    if (recipientSocket) {
      const messageData = {
        id: this.generateMessageId(),
        sender: {
          id: client.id,
          username: sender.username,
        },
        recipientId,
        content,
        timestamp: new Date(),
        type: "private",
      };

      // 发送给接收者 - 使用targetSocket单播
      recipientSocket.emit("private-message", messageData);

      // 发送已读回执（可选） - 使用client单播
      client.emit("private-message-sent", {
        messageId: messageData.id,
        recipientId,
        timestamp: new Date(),
      });
    } else {
      // 用户离线，可以存储消息等用户上线后发送
      client.emit("error", {
        type: "USER_OFFLINE",
        message: "Recipient is offline",
        recipientId,
      });
    }
  }
}
```

### 4.4 房间管理功能

```typescript
@WebSocketGateway()
export class WebSocketGateway {
  // ... 之前的代码

  // 加入房间 - 混合使用两种方式
  @SubscribeMessage("join-room")
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) {
    const user = this.users.get(client.id);

    if (!user) {
      return { error: "User not found" };
    }

    // 离开之前的房间（如果是切换房间）
    user.rooms.forEach((existingRoom) => {
      if (existingRoom !== roomId) {
        client.leave(existingRoom);
        this.rooms.get(existingRoom)?.delete(client.id);
      }
    });

    // 加入新房间 - 使用client操作
    client.join(roomId);
    user.rooms.add(roomId);

    // 初始化房间用户集合
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(client.id);

    // 通知房间内其他用户 - 使用server广播
    this.server.to(roomId).emit("user-joined-room", {
      userId: client.id,
      username: user.username,
      roomId,
      timestamp: new Date(),
      roomMembers: Array.from(this.rooms.get(roomId)).map((id) => ({
        id,
        username: this.users.get(id)?.username,
      })),
    });

    return {
      success: true,
      roomId,
      members: Array.from(this.rooms.get(roomId)).map((id) =>
        this.users.get(id)
      ),
    };
  }

  // 离开房间
  @SubscribeMessage("leave-room")
  handleLeaveRoom(client: Socket, roomId: string) {
    // 使用client操作离开房间
    client.leave(roomId);

    const user = this.users.get(client.id);
    if (user) {
      user.rooms.delete(roomId);
    }

    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(client.id);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    // 通知房间内其他用户 - 使用server广播
    this.server.to(roomId).emit("user-left-room", {
      userId: client.id,
      username: user?.username,
      roomId,
      timestamp: new Date(),
    });

    return { success: true, roomId };
  }

  // 创建房间
  @SubscribeMessage("create-room")
  handleCreateRoom(client: Socket, payload: any) {
    const { roomId, roomName, isPrivate = false, password } = payload;

    if (this.rooms.has(roomId)) {
      return { error: "Room already exists" };
    }

    const roomData = {
      id: roomId,
      name: roomName,
      createdBy: client.id,
      createdAt: new Date(),
      isPrivate,
      members: new Set(),
      settings: {
        maxUsers: 100,
        allowFileSharing: true,
        requireApproval: false,
      },
    };

    this.rooms.set(roomId, new Set([client.id]));
    // 使用client操作加入房间
    client.join(roomId);

    const user = this.users.get(client.id);
    if (user) {
      user.rooms.add(roomId);
    }

    // 使用server广播房间创建事件
    this.server.emit("room-created", {
      room: roomData,
      creator: {
        id: client.id,
        username: user?.username,
      },
    });

    return { success: true, room: roomData };
  }
}
```

## 5. 高级功能实现

### 5.1 文件传输和媒体共享

```typescript
@WebSocketGateway()
export class WebSocketGateway {
  // ... 之前的代码

  // 处理文件传输
  @SubscribeMessage("file-upload")
  async handleFileUpload(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    const {
      fileName,
      fileType,
      fileSize,
      chunk,
      totalChunks,
      chunkIndex,
      roomId,
    } = payload;
    const user = this.users.get(client.id);

    // 验证文件大小
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize > MAX_FILE_SIZE) {
      // 使用client单播发送错误
      client.emit("file-error", {
        fileName,
        error: "File size exceeds limit",
      });
      return;
    }

    // 发送文件块接收确认 - 使用client单播
    client.emit("chunk-received", {
      fileName,
      chunkIndex,
      totalChunks,
    });

    // 如果是最后一个块，则发送完成通知
    if (chunkIndex === totalChunks - 1) {
      const fileData = {
        id: this.generateFileId(),
        fileName,
        fileType,
        fileSize,
        uploadedBy: {
          id: client.id,
          username: user.username,
        },
        uploadedAt: new Date(),
        roomId,
        url: `/files/${this.generateFileId()}.${this.getFileExtension(
          fileName
        )}`,
      };

      // 广播文件上传完成
      if (roomId) {
        // 使用server广播到房间
        this.server.to(roomId).emit("file-uploaded", fileData);
      } else {
        // 使用client.broadcast广播给除自己外的所有人
        client.broadcast.emit("file-uploaded", fileData);
      }
    }
  }

  // 屏幕共享控制
  @SubscribeMessage("screen-share-start")
  handleScreenShareStart(client: Socket, payload: any) {
    const { roomId, streamId } = payload;
    const user = this.users.get(client.id);

    // 使用server广播到房间
    this.server.to(roomId).emit("screen-share-started", {
      userId: client.id,
      username: user.username,
      streamId,
      timestamp: new Date(),
    });

    // 记录屏幕共享状态
    user.isSharingScreen = true;
    user.screenShareStreamId = streamId;
  }

  @SubscribeMessage("screen-share-stop")
  handleScreenShareStop(client: Socket, roomId: string) {
    const user = this.users.get(client.id);

    // 使用server广播到房间
    this.server.to(roomId).emit("screen-share-stopped", {
      userId: client.id,
      username: user.username,
      timestamp: new Date(),
    });

    user.isSharingScreen = false;
    user.screenShareStreamId = null;
  }
}
```

### 5.2 实时协作功能

```typescript
@WebSocketGateway()
export class WebSocketGateway {
  // ... 之前的代码

  // 白板协作
  @SubscribeMessage("whiteboard-draw")
  handleWhiteboardDraw(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    const { roomId, drawingData } = payload;

    // 广播绘图数据给房间内其他用户
    // 注意：client.to() 是发送给房间内除了自己的其他人
    client.to(roomId).emit("whiteboard-update", {
      userId: client.id,
      drawingData,
      timestamp: new Date(),
    });
  }

  // 实时文档编辑
  @SubscribeMessage("document-edit")
  handleDocumentEdit(client: Socket, payload: any) {
    const { roomId, documentId, changes, version } = payload;

    // 使用 Operational Transformation 处理并发编辑
    const transformedChanges = this.transformChanges(changes, version);

    // 广播编辑内容到房间
    this.server.to(roomId).emit("document-updated", {
      documentId,
      changes: transformedChanges,
      editorId: client.id,
      version: version + 1,
      timestamp: new Date(),
    });
  }

  // 投票/问卷功能
  @SubscribeMessage("create-poll")
  handleCreatePoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any
  ) {
    const { roomId, question, options, duration } = payload;
    const pollId = this.generatePollId();

    const poll = {
      id: pollId,
      question,
      options: options.map((option) => ({
        id: this.generateOptionId(),
        text: option,
        votes: 0,
        voters: new Set(),
      })),
      createdBy: client.id,
      createdAt: new Date(),
      endsAt: new Date(Date.now() + duration * 60000),
      isActive: true,
      roomId,
    };

    // 存储投票
    this.activePolls.set(pollId, poll);

    // 广播新投票到房间 - 使用server
    this.server.to(roomId).emit("poll-created", poll);

    // 设置投票结束定时器
    setTimeout(() => {
      this.endPoll(pollId, roomId);
    }, duration * 60000);

    return { success: true, pollId };
  }

  @SubscribeMessage("vote")
  handleVote(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    const { pollId, optionId } = payload;
    const poll = this.activePolls.get(pollId);

    if (!poll || !poll.isActive) {
      return { error: "Poll not found or expired" };
    }

    const option = poll.options.find((opt) => opt.id === optionId);
    if (option && !option.voters.has(client.id)) {
      option.votes++;
      option.voters.add(client.id);

      // 广播更新到房间 - 使用server
      this.server.to(poll.roomId).emit("vote-updated", {
        pollId,
        optionId,
        votes: option.votes,
        totalVotes: poll.options.reduce((sum, opt) => sum + opt.votes, 0),
      });
    }

    return { success: true };
  }
}
```

## 6. 安全与监控

### 6.1 安全中间件

```typescript
// websocket.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class WebSocketAuthMiddleware implements NestMiddleware {
  async use(socket: Socket, next: Function) {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        throw new Error("Authentication token required");
      }

      // 验证 token
      const user = await this.validateToken(token);

      // 将用户信息附加到 socket 对象
      socket.data.user = user;

      // 速率限制检查
      const isRateLimited = await this.checkRateLimit(socket.id);
      if (isRateLimited) {
        throw new Error("Rate limit exceeded");
      }

      next();
    } catch (error) {
      next(new Error(error.message));
    }
  }

  private async validateToken(token: string): Promise<any> {
    // 实现 JWT 验证逻辑
    // 返回用户信息
  }

  private async checkRateLimit(socketId: string): Promise<boolean> {
    // 实现速率限制逻辑
    return false;
  }
}
```

### 6.2 监控与日志

```typescript
// websocket.gateway.ts 中添加监控功能
@WebSocketGateway()
export class WebSocketGateway {
  private metrics = {
    connections: 0,
    messagesSent: 0,
    messagesReceived: 0,
    roomsCreated: 0,
    errors: 0,
  };

  // 监控端点 - 使用装饰器方式
  @SubscribeMessage("get-metrics")
  handleGetMetrics(@ConnectedSocket() client: Socket) {
    const metrics = {
      ...this.metrics,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      activeUsers: this.users.size,
      activeRooms: this.rooms.size,
      timestamp: new Date(),
    };

    // 使用client单播返回指标
    client.emit("metrics", metrics);
  }

  // 错误处理
  @SubscribeMessage("error")
  handleError(client: Socket, error: any) {
    this.metrics.errors++;
    this.logger.error(`Client ${client.id} error:`, error);

    // 发送错误报告给监控系统
    this.reportError({
      clientId: client.id,
      error,
      timestamp: new Date(),
    });
  }

  private reportError(errorData: any) {
    // 实现错误上报逻辑
  }
}
```

## 7. 性能优化

### 7.1 连接池管理

```typescript
// connection-manager.service.ts
import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class ConnectionManagerService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });
  }

  // 分布式连接管理
  async trackConnection(socketId: string, userData: any) {
    await this.redisClient.hset(
      "socket:connections",
      socketId,
      JSON.stringify(userData)
    );

    // 设置过期时间
    await this.redisClient.expire(`socket:${socketId}`, 3600);
  }

  // 获取所有活跃连接
  async getActiveConnections() {
    const connections = await this.redisClient.hgetall("socket:connections");
    return Object.keys(connections).map((socketId) =>
      JSON.parse(connections[socketId])
    );
  }
}
```

### 7.2 消息队列集成

```typescript
// websocket.queue.service.ts
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class WebSocketQueueService {
  private messageQueue: Queue;

  constructor() {
    this.messageQueue = new Queue("websocket-messages", {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    });
  }

  // 异步处理消息
  async queueMessage(message: any) {
    await this.messageQueue.add("process-message", message, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });
  }

  // 处理离线消息
  async handleOfflineMessage(userId: string, message: any) {
    const key = `offline:${userId}`;
    await this.redisClient.lpush(key, JSON.stringify(message));
    await this.redisClient.expire(key, 86400); // 24小时
  }

  async getOfflineMessages(userId: string) {
    const key = `offline:${userId}`;
    const messages = await this.redisClient.lrange(key, 0, -1);
    await this.redisClient.del(key);
    return messages.map((msg) => JSON.parse(msg));
  }
}
```

## 8. 客户端集成示例

### 8.1 React 客户端示例

```javascript
// WebSocketClient.jsx
import React, { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";

const WebSocketClient = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // 初始化连接
    const newSocket = io("http://localhost:3000/chat", {
      auth: {
        token: localStorage.getItem("token"),
      },
      query: {
        username: localStorage.getItem("username"),
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // 连接事件
    newSocket.on("connect", () => {
      setConnected(true);
      console.log("Connected to WebSocket server");
    });

    newSocket.on("disconnect", (reason) => {
      setConnected(false);
      console.log("Disconnected:", reason);
    });

    // 消息处理
    newSocket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on("private-message", (data) => {
      setMessages((prev) => [...prev, { ...data, isPrivate: true }]);
    });

    newSocket.on("user-connected", (data) => {
      setUsers((prev) => [...prev, data]);
    });

    newSocket.on("user-disconnected", (data) => {
      setUsers((prev) => prev.filter((user) => user.userId !== data.userId));
    });

    // 错误处理
    newSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // 清理函数
    return () => {
      newSocket.close();
    };
  }, []);

  // 发送消息
  const sendMessage = useCallback(
    (content, roomId = null) => {
      if (socket && connected) {
        socket.emit("message", { content, room: roomId });
      }
    },
    [socket, connected]
  );

  // 加入房间
  const joinRoom = useCallback(
    (roomId) => {
      if (socket && connected) {
        socket.emit("join-room", roomId);
      }
    },
    [socket, connected]
  );

  // 创建房间
  const createRoom = useCallback(
    (roomName, isPrivate = false) => {
      if (socket && connected) {
        const roomId = generateRoomId();
        socket.emit("create-room", {
          roomId,
          roomName,
          isPrivate,
        });
      }
    },
    [socket, connected]
  );

  return {
    socket,
    messages,
    connected,
    users,
    rooms,
    sendMessage,
    joinRoom,
    createRoom,
  };
};

export default WebSocketClient;
```

## 9. 最佳实践和部署建议

### 9.1 参数接收最佳实践

1. **一致性原则**

   - 在一个项目中保持统一的参数接收风格
   - 简单处理器使用显式参数：`(client, payload)`
   - 复杂处理器使用装饰器：`(@MessageBody() payload, @ConnectedSocket() client)`

2. **正确使用 Socket 和 Server**

   - 操作**特定用户**时用 `Socket` 对象：单播、加入房间、离开房间
   - 操作**多个用户**时用 `Server` 对象：广播、房间广播、获取所有连接

3. **避免常见错误**

   ```typescript
   // ❌ 错误：缺少client参数，无法进行房间操作
   @SubscribeMessage('sendMessage')
   sendMessage(@MessageBody() payload: any): void {
     // 这里无法调用 client.join() 或 client.leave()
   }

   // ✅ 正确：添加client参数
   @SubscribeMessage('sendMessage')
   sendMessage(@MessageBody() payload: any, @ConnectedSocket() client: Socket): void {
     // 现在可以操作client了
   }
   ```

### 9.2 性能最佳实践

1. **连接管理**

   - 实现心跳机制保持连接活跃
   - 使用连接池避免过多并发连接
   - 实现自动重连机制

2. **消息优化**

   - 压缩大型消息
   - 分批发送大量数据
   - 使用二进制传输减少开销

3. **资源清理**
   - 及时清理断开连接的资源
   - 实现消息清理策略
   - 监控内存使用情况

### 9.3 部署配置

```yaml
# Docker 部署示例
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - WEBSOCKET_PATH=/socket.io
    depends_on:
      - redis
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app

volumes:
  redis-data:
```

## 10. 结论

NestJS 提供了一套完整且优雅的 WebSocket 解决方案。通过网关、订阅装饰器、中间件等特性，我们可以构建功能强大、可扩展的实时应用程序。本文涵盖了从基础连接到高级功能实现的各个方面，特别强调了：

### 10.1 **核心概念理解：**

1. **参数接收的两种方式**：显式参数 vs 装饰器方式，各有适用场景
2. **Socket 与 Server 的区别**：这是理解 NestJS WebSocket 的关键
   - `Socket`：代表**单个客户端连接**，用于单播操作
   - `Server`：代表**整个 WebSocket 服务器**，用于广播和房间管理

### 10.2 **实际开发建议：**

- **简单场景**使用显式参数方式：`(client, payload)`
- **复杂场景**使用装饰器方式提高可读性
- **操作特定用户**时用 `Socket` 对象
- **广播或房间操作**时用 `Server` 对象
- 始终保持参数接收风格的一致性

### 10.3 **涵盖的完整知识体系：**

1. **核心架构**：网关、命名空间、房间管理
2. **消息处理**：文本消息、私聊、文件传输
3. **协作功能**：白板、文档编辑、投票系统
4. **安全监控**：认证、速率限制、错误处理
5. **性能优化**：连接池、消息队列、Redis 集成
6. **客户端集成**：React 示例和最佳实践

在实际项目中，建议根据具体需求选择合适的功能组合，并始终关注性能、安全性和用户体验。通过合理的设计和优化，NestJS WebSocket 可以支撑大规模的实时应用需求。

## 11. 扩展资源

- [NestJS 官方文档 - WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Socket.IO 官方文档](https://socket.io/docs/v4/)
- [Redis Pub/Sub 模式](https://redis.io/topics/pubsub)
- [WebSocket 协议 RFC](https://tools.ietf.org/html/rfc6455)

希望本文能帮助你更好地理解和应用 NestJS 中的 WebSocket 技术。在实际开发中，记得根据具体场景进行调整和优化，打造最适合你的实时通信解决方案。
