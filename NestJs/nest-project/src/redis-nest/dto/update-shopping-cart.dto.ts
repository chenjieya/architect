import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/mapped-types';
import { CreateShoppingCartDto } from './create-shopping-cart.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateShoppingCartDto extends IntersectionType(
  PickType(CreateShoppingCartDto, ['userId', 'carData']),
  PartialType(OmitType(CreateShoppingCartDto, ['userId', 'carData'])),
) {
  @IsNotEmpty()
  id: number;
}
