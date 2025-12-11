import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

class CarData {
  @Column()
  count: number;
}

@Entity({
  name: 'shopping',
})
export class ShoppingCart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('simple-json')
  carData: Record<string, number>;

  // @Column(() => CarData)
  // carData: CarData;
}
