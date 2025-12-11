import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

class carData {
  @IsNotEmpty()
  @IsNumber({}, { message: 'count必须是数字类型' })
  count: number;
}

export class CreateShoppingCartDto {
  @IsNotEmpty()
  userId: number;

  // @ValidateNested() // 验证嵌套对象
  // @Type(() => carData)
  // carData: carData;

  @IsNotEmpty()
  carData: Record<string, number>;
}
