import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail(
    {},
    {
      message: '邮箱校验失败',
    },
  )
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  username: string;

  @MinLength(6, {
    message: '密码不得少于6位数',
  })
  @IsNotEmpty({
    message: '密码不能为空',
  })
  password: string;
}
