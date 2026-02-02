import { IsNotEmpty } from 'class-validator';

export class AiQuestionDto {
  @IsNotEmpty({ message: '聊天内容不能为空' })
  question: string;
}
