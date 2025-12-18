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
  UseInterceptors,
} from '@nestjs/common';
import { FriendShipService } from './friend-ship.service';
import { FriendRequestDto } from './dto/friend-request.dto';
import { UserInfo } from 'src/custom-decorator/custom.decorator';

@Controller('friend-ship')
export class FriendShipController {
  constructor(private readonly friendShipService: FriendShipService) {}

  // 发送好友请求
  @Post('add')
  async postFriendRequest(
    @UserInfo('id') userId: string,
    @Body() friendRequestDto: FriendRequestDto,
  ) {
    if (+userId === friendRequestDto.friendId) {
      throw new BadRequestException('不能添加自己为好友');
    }
    return await this.friendShipService.postFriendRequest(
      +userId,
      friendRequestDto,
    );
  }

  // 拒绝好友请求
  @Get('reject/:id')
  async rejectFriend(@Param('id', ParseIntPipe) id: number) {
    return await this.friendShipService.rejectFriend(id);
  }

  // 同意好友请求
  @Get('resolve/:id')
  async resolveFriend(@Param('id', ParseIntPipe) id: number) {
    return await this.friendShipService.resolveFriend(id);
  }

  // 获取我收到的好友请求
  @Get('request-list')
  async getRequestList(@UserInfo('id') id: string) {
    return await this.friendShipService.getRequestList(+id);
  }

  // 获取到我所有的好友
  @Get('list')
  @UseInterceptors(ClassSerializerInterceptor)
  async getMyFriendList(@UserInfo('id') userId: string) {
    return await this.friendShipService.getMyFriendList(+userId);
  }

  // 删除好友
  @Delete('delete/:id')
  async deleteFriend(
    @Param('id', ParseIntPipe) friendId: number,
    @UserInfo('id') userId: string,
  ) {
    return await this.friendShipService.deleteFriend(friendId, +userId);
  }
}
