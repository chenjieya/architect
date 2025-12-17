import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Chatroom } from './chatroom.entity';

@Entity()
export class UserChatroom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '用户ID',
    name: 'user_id',
  })
  userId: number;

  @Column({
    comment: '聊天室ID',
    name: 'chatroom_id',
  })
  chatroomId: number;

  @CreateDateColumn({ name: 'join_time' })
  joinTime: Date;

  // 用户
  @ManyToOne(() => User, (user) => user.chatrooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 聊天室
  @ManyToOne(() => Chatroom, (chatroom) => chatroom.userChatrooms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatroom_id' })
  chatroom: Chatroom;
}
