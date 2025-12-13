import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Login } from './entities/login.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterLoginDto } from './dto/register-login.dto';
import md5 from 'md5';

@Injectable()
export class LoginJwtService {
  @InjectRepository(Login)
  private readonly loginRespotity: Repository<Login>;

  async login(loginDto: LoginUserDto) {
    // 根据用户名检查用户是否存在
    const user = await this.loginRespotity.findOneBy({
      username: loginDto.username,
    });

    if (!user) {
      throw new BadRequestException('用户名不存在，请进行注册');
    }

    // 存在则进行密码校验
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (user.password !== md5(loginDto.password)) {
      throw new BadRequestException('密码错误');
    }
    // 密码正确,则成功登录
    return loginDto;
  }

  async register(registerDto: RegisterLoginDto) {
    // 根据用户名,校验用户是否已经存在
    const user = await this.loginRespotity.findOneBy({
      username: registerDto.username,
    });
    // 用户名存在，则抛出错误
    if (user) {
      throw new BadRequestException('用户已经存在');
    }
    // 用户名不存在，则进行注册
    const newUser = new Login();
    newUser.username = registerDto.username;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    newUser.password = md5(registerDto.password) as string;

    try {
      await this.loginRespotity.save(newUser);
      return true;
    } catch (err) {
      console.log(err, 'erer');
      return false;
    }
  }
}
