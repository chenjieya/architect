import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;
  @IsNotEmpty({ message: '昵称不能为空' })
  nickName: string;
  @IsNotEmpty({ message: '头像不能为空' })
  headPic: string;
}
