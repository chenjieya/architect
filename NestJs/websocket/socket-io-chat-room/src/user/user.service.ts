import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { In, Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import md5 from 'md5';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChatroomService } from 'src/chatroom/chatroom.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userReposity: Repository<User>,
    private readonly chatroomService: ChatroomService,
  ) {}

  // 根据id查找用户
  async findUserByIds(ids: number[]) {
    return await this.userReposity.find({
      where: {
        id: In(ids),
      },
    });
  }

  // 根据id查找用户
  async findUserById(id: number) {
    return await this.userReposity.findOne({
      where: {
        id,
      },
    });
  }

  // 根据名字查找用户
  async findUserByName(username: string) {
    return await this.userReposity.findOne({
      where: {
        username,
      },
    });
  }

  async register(registerUserDto: RegisterUserDto) {
    // 从数据库中查找是否存在相同的用户
    const user = await this.findUserByName(registerUserDto.username);

    if (user) {
      throw new BadRequestException('用户已经存在了');
    }

    const newUser = new User();
    newUser.username = registerUserDto.username;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    newUser.password = md5(registerUserDto.password);
    newUser.email = registerUserDto.email;
    newUser.nickName = registerUserDto.nickName;
    newUser.headPic = registerUserDto.headPic;

    const newUserRes = await this.userReposity.save(newUser);

    // 用户注册成功之后，添加到 默认 的官方群聊中
    await this.chatroomService.joinGuanFangChatroom(newUserRes.id);

    return newUserRes;
  }

  async updateUser(updateUser: UpdateUserDto) {
    const { id: userId } = updateUser;
    // 根据用户id查找出对应的用户
    const userEntity = await this.userReposity.findOne({
      where: {
        id: userId,
      },
    });

    // 用户不存在则报错
    if (!userEntity) {
      throw new BadRequestException('用户不存在');
    }

    // 更新用户信息
    await this.userReposity.update(
      {
        id: userId,
      },
      {
        email: updateUser.email,
        nickName: updateUser.nickName,
        headPic: updateUser.headPic,
      },
    );

    return await this.findUserById(userId);
  }
}
