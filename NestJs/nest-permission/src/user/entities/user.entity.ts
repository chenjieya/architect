import { Exclude } from 'class-transformer';
import { Role } from 'src/role/entities/role.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @ManyToMany(() => Role, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_role_relation',
  })
  roles: Role[];
}
