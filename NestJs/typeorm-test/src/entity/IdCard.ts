import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class IdCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 18 })
  cardNo: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  birthday: Date;

  @Column()
  email: string;

  // 这是从表，关联用户表
  @OneToOne(() => User, (user) => user.idCard)
  // 会自动添加外键
  @JoinColumn()
  user: User;
}
