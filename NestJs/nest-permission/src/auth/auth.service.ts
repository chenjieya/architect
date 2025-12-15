import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Role } from 'src/role/entities/role.entity';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  // 用于校验local
  async validateUser(username: string, pasword: string) {
    // 从user.service中获取到当前用户
    const user = await this.userService.findOneByName(username);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (user.password !== pasword) {
      throw new BadRequestException('密码不正确');
    }

    return user;
  }

  loginCallback(req: Request, loginDto: LoginUserDto) {
    const token = this.jwtService.sign({
      id: loginDto.id,
      username: loginDto.username,
      roles: req.user?.roles,
    });

    return {
      access_token: token,
    };
  }
}
