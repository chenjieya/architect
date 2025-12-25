import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatroom } from 'src/entities/chatroom.entity';
import { UserChatroom } from 'src/entities/user-chatroom.entity';
import { User } from 'src/entities/user.entity';
import type { User as UserType } from 'src/auth/local.gratety';
import { FriendShipService } from 'src/friend-ship/friend-ship.service';
import { In, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatroomService implements OnModuleInit {
  constructor(
    private readonly shipService: FriendShipService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserChatroom)
    private readonly userChatroomRepository: Repository<UserChatroom>,
    @InjectRepository(Chatroom)
    private readonly chatroomRepository: Repository<Chatroom>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // 在模块初始化时调用
  async onModuleInit() {
    console.log('初始化聊天室模块...');
    await this.createGuanFangChatroom();
  }

  // 创建私聊聊天室
  async createPrivateChat(friendId: number, userInfo: UserType) {
    // 根据friendId查询出对应的用户信息
    const user = await this.userRepository.findOne({
      where: {
        id: friendId,
      },
      select: ['username'],
    });

    if (!user?.username) {
      throw new BadRequestException('用户不存在');
    }
    if (!userInfo?.id) {
      throw new BadRequestException('用户不存在');
    }

    // 检查两位是否已经存在单聊的聊天室了
    const exist = await this.chatroomRepository
      .createQueryBuilder('chatroom')
      .innerJoin('chatroom.userChatrooms', 'uc')
      .where('chatroom.type = :type', { type: false })
      .andWhere('uc.userId IN (:...userIds)', {
        userIds: [userInfo.id, friendId],
      })
      .groupBy('chatroom.id')
      .having('COUNT(DISTINCT uc.userId) = 2')
      .getOne();

    if (exist) {
      throw new BadRequestException('当前聊天室已经存在');
    }
    // 检查两位是否是好友关系
    const friendUser = await this.shipService.checkFriendShip(userInfo.id, [
      friendId,
    ]);

    if (!friendUser) {
      throw new BadRequestException(`请先添加用户「${user.username}」为好友`);
    }

    // 创建聊天室-聊天室的名字是friendId对应的名字
    const chatroomEntity = this.chatroomRepository.create({
      name: `${user.username}-${userInfo.username}`,
      type: false,
    });

    const chatroom = await this.chatroomRepository.save(chatroomEntity);

    // 创建两者的关系
    const entity1 = this.userChatroomRepository.create({
      userId: userInfo.id,
      chatroomId: chatroom.id,
    });

    const entity2 = this.userChatroomRepository.create({
      userId: friendId,
      chatroomId: chatroom.id,
    });

    await this.userChatroomRepository.save([entity1, entity2]);

    // 提醒socket创建聊天室成功
    this.eventEmitter.emit('chatroom.created', {
      chatroomId: chatroom.id,
      memberIds: [userInfo.id, friendId],
    });

    return chatroom;
  }

  // 创建群聊聊天室
  async createGroupChat(userInfo: UserType, friendIds: number[]) {
    // 检查是否是好友关系
    if (!userInfo?.id) {
      throw new BadRequestException('程序异常，请联系管理员');
    }
    const isFriend = await this.shipService.checkFriendShip(
      userInfo.id,
      friendIds,
    );
    if (!isFriend) {
      throw new BadRequestException('存在不是好友关系的ID');
    }

    // 创建聊天室
    const chatroomEntity = this.chatroomRepository.create({
      name: `${userInfo?.username}(创建的群聊)`,
      type: true,
    });

    const chatroom = await this.chatroomRepository.save(chatroomEntity);

    // 维护用户和聊天室的关系
    const userRelationChatroom: UserChatroom[] = [];
    const myChatEntity = this.userChatroomRepository.create({
      userId: userInfo.id,
      chatroomId: chatroom.id,
    });
    userRelationChatroom.push(myChatEntity);

    // 好友和聊天室关系
    friendIds.forEach((friendId) => {
      const friendChatEntity = this.userChatroomRepository.create({
        userId: friendId,
        chatroomId: chatroom.id,
      });

      userRelationChatroom.push(friendChatEntity);
    });

    await this.userChatroomRepository.save(userRelationChatroom);

    // 提醒socket创建聊天室成功
    this.eventEmitter.emit('chatroom.created', {
      chatroomId: chatroom.id,
      memberIds: [userInfo.id, ...friendIds],
    });

    return chatroom;
  }

  // 获取用户所属群聊接口
  async getChatWindowList(userId: number) {
    // 查询关系表, 找到和我相关的群聊信息
    const userChatroomList = await this.userChatroomRepository.find({
      where: {
        userId,
      },
      select: ['chatroomId'],
    });
    const chatroomIds = userChatroomList.map((item) => item.chatroomId);

    if (!chatroomIds.length) {
      return [];
    }

    // 根据聊天室id，获取到所有的 聊天室信息
    const chatroomList = await this.chatroomRepository.find({
      where: {
        id: In(chatroomIds),
      },
      relations: ['userChatrooms'],
    });

    const res = await Promise.all(
      chatroomList.map(async (item) => {
        // 单聊展示对方用户的信息
        if (!item.type) {
          // 找到除了自己的另外一个用户
          const otherUser = item.userChatrooms.find(
            (user) => user.userId !== userId,
          );
          const user = await this.userRepository.findOne({
            where: {
              id: otherUser?.userId,
            },
          });

          return {
            ...item,
            showChatroomName: user?.nickName || user?.username,
            userCount: item.userChatrooms.length,
          };
        }
        return {
          ...item,
          userCount: item.userChatrooms.length,
        };
      }),
    );

    return res;
  }

  // 查询聊天室有哪些用户
  async getMembersByChatroomId(chatroomId: number) {
    const userChatrooms = await this.userChatroomRepository.find({
      where: {
        chatroomId,
      },
      relations: ['user'],
    });

    return userChatrooms.map((item) => item.user);
  }

  // 获取单个聊天室所有信息（包含用户、聊天室信息）
  async getChatroomInfo(chatroomId: number) {
    const chatroom = await this.chatroomRepository.findOne({
      where: {
        id: chatroomId,
      },
    });

    if (!chatroom) {
      throw new BadRequestException('聊天室不存在');
    }

    const users = await this.getMembersByChatroomId(chatroomId);

    return {
      ...chatroom,
      userCount: users.length,
      user: users,
    };
  }

  // 加入聊天室
  async joinChatroom(chatroomId: number, friendId: number) {
    // 查询聊天室是不是单聊
    const chatroom = await this.chatroomRepository.findOne({
      where: {
        id: chatroomId,
      },
    });

    if (!chatroom?.type) {
      throw new BadRequestException('私聊不能加入其他人员');
    }

    const userRelationChatroom = this.userChatroomRepository.create({
      userId: friendId,
      chatroomId: chatroomId,
    });

    await this.userChatroomRepository.save(userRelationChatroom);
    return {
      success: true,
    };
  }

  // 退出聊天室
  async quitChatroom(chatroomId: number, friendId: number) {
    const chatroom = await this.chatroomRepository.findOne({
      where: {
        id: chatroomId,
      },
    });

    if (!chatroom?.type) {
      throw new BadRequestException('私聊聊天室不能退出');
    }

    await this.userChatroomRepository.delete({
      chatroomId: chatroomId,
      userId: friendId,
    });

    return {
      success: true,
    };
  }

  // 脚本，创建官方聊天室
  async createGuanFangChatroom() {
    const chatroom = await this.chatroomRepository.findOne({
      where: {
        name: '官方',
      },
    });

    if (chatroom) {
      return true;
    }

    const chatroomEntity = this.chatroomRepository.create({
      name: '官方',
      type: true,
    });

    await this.chatroomRepository.save(chatroomEntity);
    return true;
  }

  // 加入官方聊天室
  async joinGuanFangChatroom(userId: number) {
    // 查询聊天室是不是单聊
    const chatroom = await this.chatroomRepository.findOne({
      where: {
        name: '官方',
      },
    });

    const userRelationChatroom = this.userChatroomRepository.create({
      userId,
      chatroomId: chatroom?.id,
    });

    await this.userChatroomRepository.save(userRelationChatroom);
    return true;
  }
}
