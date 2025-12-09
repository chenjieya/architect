import { IsNotEmpty } from 'class-validator';

export class CreateTypeOrmNestDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  age: number;

  @IsNotEmpty()
  birthday: string;
}
