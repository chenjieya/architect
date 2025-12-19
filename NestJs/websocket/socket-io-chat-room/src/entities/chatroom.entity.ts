import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserChatroom } from './user-chatroom.entity';
import { ChatHistory } from './chat-history.entity';

@Entity()
export class Chatroom {
  @PrimaryGeneratedColumn({
    comment: '聊天室ID',
  })
  id: number;

  @Column({
    comment: '群聊名称',
    length: 50,
  })
  name: string;

  @Column({
    comment: '类型（false单聊，true群聊）',
  })
  type: boolean;

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

  // 聊天室中的用户
  @OneToMany(() => UserChatroom, (userChatroom) => userChatroom.chatroom)
  userChatrooms: UserChatroom[];

  // 聊天记录
  @OneToMany(() => ChatHistory, (chatHistory) => chatHistory.chatroom)
  messages: ChatHistory[];
}
