import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FriendShip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '用户ID',
    name: 'user_id',
  })
  userId: number;

  @Column({
    comment: '好友ID',
    name: 'friend_id',
  })
  friendId: number;

  // 用户（关系拥有者）
  @ManyToOne(() => User, (user) => user.friends, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 好友（被添加者）
  @ManyToOne(() => User, (user) => user.inverseFriends, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friend_id' })
  friend: User;
}
