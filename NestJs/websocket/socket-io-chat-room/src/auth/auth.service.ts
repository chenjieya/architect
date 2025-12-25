import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import md5 from 'md5';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { QRCODE_STATUS } from 'src/enum/qrcode';
import { User } from './local.gratety';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async validateLocal(username: string, password: string) {
    // 从数据库中将用户查询出来
    const user = await this.userService.findUserByName(username);
    // 用户不存在则抛出错误
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    // 用户存在则比对密码是否正确
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (user.password !== md5(password)) {
      throw new BadRequestException('密码不正确');
    }

    return user;
  }

  async loginCallback(req: Request, loginDto: LoginUserDto) {
    const token = this.jwtService.sign({
      username: loginDto.username,
      id: req.user?.id,
      email: req.user?.email,
    });
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;

    // 将token放到redis中
    await this.redisService.set(
      `user_${req.user?.id}:token`,
      token,
      sevenDaysInSeconds,
    );

    // 将userId存入到redis
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const qrcodeId = req.body?.qrcodeId;
    if (qrcodeId) {
      await this.redisService.set(`qrcode:${qrcodeId}`, {
        id: qrcodeId,
        status: QRCODE_STATUS.CONFIRMED,
        userId: req.user?.id,
      });
    }

    return {
      access_token: token,
    };
  }

  verferJwtToken(token: string): User {
    return this.jwtService.verify(token) as User;
  }
}
