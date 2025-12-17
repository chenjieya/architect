import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, {
    message: '密码不能少于 6 位',
  })
  password: string;
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsOptional()
  @Transform(({ value }: { value: string | null }) => value || null)
  nickName: string | null;
  @IsOptional()
  @Transform(({ value }: { value: string }) => value || '')
  headPic: string;
}
