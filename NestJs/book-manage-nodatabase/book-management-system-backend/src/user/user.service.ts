import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DbService } from 'src/db/db.service';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  @Inject(DbService)
  private readonly DbService: DbService;

  // 注册用户
  async register(user: CreateUserDto) {
    // 先读取文件
    const fileContent: User[] = await this.DbService.readFile();

    // 检查用户是否已经存在
    if (fileContent.find((item) => item.username === user.username)) {
      throw new BadRequestException('该用户已经注册');
    }

    // 写入文件
    const userContent = new User();
    userContent.username = user.username;
    userContent.password = user.password;

    fileContent.push(userContent);

    await this.DbService.writeFile(fileContent);

    // 返回创建成功
    return {
      code: 200,
      message: '用户注册成功',
      data: {
        username: user.username,
      },
    };
  }

  async login(user: CreateUserDto) {
    // 读取文件
    const userArray: User[] = await this.DbService.readFile();

    // 查找用户是否存在
    const userInfo = userArray.find((item) => item.username === user.username);

    if (!userInfo) {
      throw new BadRequestException('用户不存在，请先注册');
    }

    // 存在则校验密码是否正确
    if (userInfo.password !== user.password) {
      throw new BadRequestException('密码不正确，请重新输入');
    }

    // 返回用户信息
    return {
      code: 200,
      message: '成功登陆',
      data: {
        username: user.username,
      },
    };
  }
}
