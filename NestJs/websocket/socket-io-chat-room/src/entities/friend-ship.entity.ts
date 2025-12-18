import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FriendShip {
  @PrimaryColumn({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @PrimaryColumn({ name: 'friend_id', comment: '好友ID' })
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
