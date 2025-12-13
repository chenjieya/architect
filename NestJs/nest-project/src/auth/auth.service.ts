import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginJwtService } from 'src/login-jwt/login-jwt.service';
import md5 from 'md5';
import { LoginUserDto } from 'src/login-jwt/dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  @Inject(LoginJwtService)
  private readonly loginService: LoginJwtService;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  async validator(username: string, password: string) {
    // validate是将request.body中的用户名和密码取出
    // 然后自行进行验证
    // 最后将user放到request中返回
    const user = await this.loginService.getOne(username);

    if (!user) {
      throw new UnauthorizedException('未登录');
    }

    // 密码是否正确
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (user.password !== md5(password)) {
      throw new UnauthorizedException('未登录');
    }

    return user;
  }

  login(login: LoginUserDto) {
    const token = this.jwtService.sign({
      userId: login.id,
      username: login.username,
    });

    return {
      access_token: token,
    };
  }
}
