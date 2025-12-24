import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chatroom } from './chatroom.entity';
import { User } from './user.entity';
import { CHAT_HISTORY_TYPE_ENUM } from 'src/enum/chat-history';

@Entity()
export class ChatHistory {
  @PrimaryGeneratedColumn({
    comment: '聊天记录ID',
  })
  id: number;

  @Column({
    comment: '聊天内容',
    length: 500,
  })
  content: string;

  @Column({
    comment: '聊天内容类型（0文本、1图片、2文件）',
    default: CHAT_HISTORY_TYPE_ENUM.TEXT,
  })
  type: CHAT_HISTORY_TYPE_ENUM;

  @Column({
    comment: '聊天室ID',
    name: 'chatroom_id',
  })
  chatroomId: number;

  @Column({
    comment: '发送者ID',
    name: 'sender_id',
  })
  senderId: number;

  @CreateDateColumn({
    comment: '发送时间',
    name: 'send_time',
  })
  sendTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
    name: 'update_time',
  })
  updateTime: Date;

  // 所属聊天室
  @ManyToOne(() => Chatroom, (chatroom) => chatroom.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatroom_id' })
  chatroom: Chatroom;

  // 发送者
  @ManyToOne(() => User, (user) => user.sentMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
