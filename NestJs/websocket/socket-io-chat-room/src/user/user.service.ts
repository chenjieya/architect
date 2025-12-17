import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import md5 from 'md5';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userReposity: Repository<User>,
  ) {}

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
    return newUserRes;
  }
}
