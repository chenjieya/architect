import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
