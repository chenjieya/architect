import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {

    // 自增
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 100 })
    name: string

    @Column()
    age: number

    @Column({ length: 11 })
    phone: string

    @Column("text")
    desc: string

    @Column("double", { default: 0 })
    score: number

}
