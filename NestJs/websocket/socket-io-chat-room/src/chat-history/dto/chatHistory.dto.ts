import { IsNotEmpty } from 'class-validator';

export class ChatHistoryDto {
  @IsNotEmpty({ message: '聊天内容不能为空' })
  content: string;
  @IsNotEmpty({ message: '内容类型不能为空' })
  type: number;
  @IsNotEmpty({ message: '聊天室ID不能为空' })
  chatroomId: number;
  @IsNotEmpty({ message: '发送人ID不能为空' })
  senderId: number;
}
