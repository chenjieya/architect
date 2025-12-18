import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FriendShip } from './friend-ship.entity';
import { FriendRequest } from './friend-request.entity';
import { UserChatroom } from './user-chatroom.entity';
import { ChatHistory } from './chat-history.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn({
    comment: '用户ID',
  })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({
    comment: '密码',
    length: 50,
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    type: 'varchar',
    comment: '昵称',
    length: 50,
    nullable: true,
    default: null,
    name: 'nick_name',
  })
  nickName: string | null;

  @Column({
    comment: '邮箱',
    length: 50,
  })
  email: string;

  @Column({
    type: 'varchar',
    comment: '头像',
    length: 500,
    nullable: true,
    default: null,
    name: 'head_pic',
  })
  headPic: string | null;

  @CreateDateColumn({
    comment: '创建时间',
    name: 'create_time',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
    name: 'update_time',
  })
  updateTime: Date;

  // 作为用户拥有的好友关系
  @OneToMany(() => FriendShip, (friendShip) => friendShip.user)
  friends: FriendShip[];

  // 作为好友被别人添加的关系
  @OneToMany(() => FriendShip, (friendship) => friendship.friend)
  inverseFriends: FriendShip[];

  // 发送的好友请求
  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.fromUser)
  sendRequests: FriendRequest[];

  // 收到的好友请求
  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.toUser)
  receivedRequests: FriendRequest[];

  // 加入的聊天室
  @OneToMany(() => UserChatroom, (userChatroom) => userChatroom.user)
  chatrooms: UserChatroom[];

  // 发送的消息
  @OneToMany(() => ChatHistory, (chatHistory) => chatHistory.sender)
  sentMessages: ChatHistory[];
}
