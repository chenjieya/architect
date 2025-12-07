import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Employ } from "./Employ";

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  desc: string;

  @OneToMany(() => Employ, (employ) => employ.department, {
    cascade: true,
  })
  employs: Employ[];
}
