import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
export class RegisterLoginDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 20, { message: '用户名长度必须在6个字符到20个字符之间' })
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: '用户名只能包含字母、数字、下划线和破折号',
  })
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20, { message: '密码长度必须在6个字符到20个字符之间' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d_%$]+$/, {
    message:
      '密码只能包含字母、数字和特殊符号_、%、$,并且至少包含一个大小写字母和数字',
  })
  password: string;
}
