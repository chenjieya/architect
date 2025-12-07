import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./Order";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToMany(() => Order, (order) => order.products)
  @JoinTable({
    name: "order_products",
    joinColumn: {
      name: "produc_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "order_id",
      referencedColumnName: "id",
    },
  })
  orders: Order[];
}
