import { IsNotEmpty, IsNumber } from 'class-validator';

export class FriendRequestDto {
  @IsNotEmpty({ message: '好友ID不能为空' })
  @IsNumber()
  friendId: number;
}
