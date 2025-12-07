import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { IdCard } from "./IdCard";

@Entity()
export class User {
  // 自增
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, name: "u_name" })
  name: string;

  @Column({ name: "u_age" })
  age: number;

  @Column({ length: 11 })
  phone: string;

  @Column("text")
  desc: string;

  @Column("double", { default: 0 })
  score: number;

  @OneToOne(() => IdCard, (idCard) => idCard.user, {
    cascade: true,
    onDelete: "CASCADE",
  })
  idCard: IdCard;
}
