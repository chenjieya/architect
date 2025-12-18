import { BadRequestException, Injectable } from '@nestjs/common';
import { FriendRequestDto } from './dto/friend-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequest } from 'src/entities/friend-request.entity';
import { Repository } from 'typeorm';
import { FRIEND_REQUEST_ENUM } from 'src/enum/friend';
import { FriendShip } from 'src/entities/friend-ship.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class FriendShipService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
    @InjectRepository(FriendShip)
    private readonly friendShipRepository: Repository<FriendShip>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 发送好友请求
  async postFriendRequest(userId: number, friendRequestDto: FriendRequestDto) {
    // 从请求关系表中，查找是否存在相同的请求记录
    const friendRequest = await this.friendRequestRepository.findOne({
      where: {
        fromUserId: userId,
        toUserId: friendRequestDto.friendId,
      },
      order: {
        createTime: 'DESC',
      },
    });

    // 请求记录不是待处理中，或者不存在，则可以继续添加一条新的好友请求记录
    if (
      !friendRequest ||
      friendRequest.status !== FRIEND_REQUEST_ENUM.PENDING
    ) {
      // 将好友请求记录保存到数据库中
      const newRequest = new FriendRequest();
      newRequest.fromUserId = userId;
      newRequest.toUserId = friendRequestDto.friendId;
      newRequest.status = FRIEND_REQUEST_ENUM.PENDING;
      return await this.friendRequestRepository.save(newRequest);
    }

    return friendRequest;
  }

  // 拒绝添加好友
  async rejectFriend(requestId: number) {
    const requestRecord = await this.friendRequestRepository.findOne({
      where: {
        id: requestId,
      },
    });

    // 查询不到记录
    if (!requestRecord) {
      throw new BadRequestException('好友请求不存在');
    }

    // 当前状态不是pending状态，则不允许修改
    if (requestRecord.status !== FRIEND_REQUEST_ENUM.PENDING) {
      throw new BadRequestException('当前请求无法拒绝');
    }

    await this.friendRequestRepository.update(
      {
        id: requestId,
      },
      {
        status: FRIEND_REQUEST_ENUM.REJECT,
      },
    );

    return {
      success: true,
    };
  }

  // 同意添加好友
  async resolveFriend(requestId: number) {
    const requestRecord = await this.friendRequestRepository.findOne({
      where: {
        id: requestId,
      },
    });

    // 查询不到记录
    if (!requestRecord) {
      throw new BadRequestException('好友请求不存在');
    }

    // 当前状态不是pending状态，则不允许修改
    if (requestRecord.status !== FRIEND_REQUEST_ENUM.PENDING) {
      throw new BadRequestException('当前请求无法同意');
    }

    // 同意好友关系
    await this.friendRequestRepository.update(
      {
        id: requestId,
      },
      {
        status: FRIEND_REQUEST_ENUM.RESOLVE,
      },
    );

    try {
      // 维护好友关系表
      // 查询是否存在还有关系
      const friendShipList = await this.friendShipRepository.find({
        where: {
          userId: requestRecord.toUserId,
          friendId: requestRecord.fromUserId,
        },
      });

      if (!friendShipList.length) {
        // 添加好友关系
        const entity = this.friendShipRepository.create({
          userId: requestRecord.toUserId,
          friendId: requestRecord.fromUserId,
        });

        await this.friendShipRepository.save(entity);
        return {
          success: true,
        };
      }
    } catch {
      // 有可能已经是好友了
      return {
        success: false,
      };
    }
  }

  // 获取收到好友请求列表
  async getRequestList(userId: number) {
    return await this.friendRequestRepository.find({
      where: {
        toUserId: userId,
        status: FRIEND_REQUEST_ENUM.PENDING,
      },
      relations: ['fromUser'],
    });
  }

  // 获取到所有的好友
  async getMyFriendList(userId: number) {
    const ids = new Set<number>();

    // 从用户关系表中查找出我的id相关的数据
    const reloationList = await this.friendShipRepository.find({
      where: [{ userId: userId }, { friendId: userId }],
    });

    for (let i = 0; i < reloationList.length; i++) {
      ids.add(reloationList[i].userId);
      ids.add(reloationList[i].friendId);
    }

    // 过滤掉我自己
    const myFriendIds = [...ids].filter((item) => item !== userId);

    // 循环将所有的好友都查出来
    const res: User[] = [];

    for (let i = 0; i < myFriendIds.length; i++) {
      const item = await this.userRepository.findOne({
        where: {
          id: myFriendIds[i],
        },
      });

      if (item) {
        res.push(item);
      }
    }

    return res;
  }

  // 删除好友
  async deleteFriend(friendId: number, userId: number) {
    await this.friendShipRepository.delete([
      { userId, friendId },
      { userId: friendId, friendId: userId },
    ]);

    return {
      success: true,
    };
  }
}
