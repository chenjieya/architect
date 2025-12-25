import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { UserInfo } from 'src/custom-decorator/custom.decorator';
import type { User } from 'src/auth/local.gratety';

@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Get('create-private-chat/:id')
  async createPrivateChat(
    @Param('id', ParseIntPipe) friendId: number,
    @UserInfo() userInfo: User,
  ) {
    return await this.chatroomService.createPrivateChat(friendId, userInfo);
  }

  @Post('create-group-chat')
  async createGroupChat(
    @Body() friendIds: number[],
    @UserInfo() userInfo: User,
  ) {
    return await this.chatroomService.createGroupChat(userInfo, friendIds);
  }

  @Get('list')
  @UseInterceptors(ClassSerializerInterceptor)
  async list(@UserInfo('id') userId: string) {
    return await this.chatroomService.getChatWindowList(+userId);
  }

  @Get('members')
  @UseInterceptors(ClassSerializerInterceptor)
  async getMembersByChatroomId(
    @Query('chatroomId', ParseIntPipe) chatroomId: number,
  ) {
    return await this.chatroomService.getMembersByChatroomId(chatroomId);
  }

  @Get('info')
  async getChatroomInfo(@Query('chatroomId', ParseIntPipe) chatroomId: number) {
    return await this.chatroomService.getChatroomInfo(chatroomId);
  }

  @Post('join')
  async join(@Body() info: { chatroomId: string; friendId: string }) {
    const { chatroomId, friendId } = info;

    if (!chatroomId || !friendId) {
      throw new BadRequestException('ID不能为空');
    }

    return await this.chatroomService.joinChatroom(+chatroomId, +friendId);
  }

  @Delete('quit')
  async delete(@Body() info: { chatroomId: string; friendId: string }) {
    const { chatroomId, friendId } = info;

    if (!chatroomId || !friendId) {
      throw new BadRequestException('ID不能为空');
    }

    return await this.chatroomService.quitChatroom(+chatroomId, +friendId);
  }
}
