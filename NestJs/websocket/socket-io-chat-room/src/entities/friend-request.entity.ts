import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn({
    comment: '好友申请ID',
  })
  id: number;

  @Column({
    comment: '发送方ID',
    name: 'from_user_id',
  })
  fromUserId: number;

  @Column({
    comment: '接收方ID',
    name: 'to_user_id',
  })
  toUserId: number;

  @Column({
    comment: '状态（待处理、已同意、已拒绝）',
    length: 10,
  })
  status: string;

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

  // 发送方用户
  @ManyToOne(() => User, (user) => user.sendRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  // 接收方用户
  @ManyToOne(() => User, (user) => user.receivedRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'to_user_id' })
  toUser: User;
}
