import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginJwtService } from './login-jwt.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterLoginDto } from './dto/register-login.dto';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoginGuard } from 'src/login.guard';

@Controller('login-jwt')
export class LoginJwtController {
  @Inject(JwtService)
  private readonly jwt: JwtService;

  constructor(private readonly loginJwtService: LoginJwtService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.loginJwtService.login(loginDto);

    // 登录将要成功
    if (result) {
      // 设置jwt
      const token = this.jwt.sign({
        user: {
          id: result.id,
          username: result.username,
        },
      });

      response.setHeader('Authorization', `Bearer ${token}`);

      return {
        message: '登录成功',
        data: result,
        code: 200,
      };
    } else {
      return {
        message: '登录失败',
        code: 400,
        data: null,
      };
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterLoginDto) {
    return await this.loginJwtService.register(registerDto);
  }

  @Get('info')
  @UseGuards(LoginGuard)
  getUserInfo() {
    return '获取用户详细信息';
  }

  @Get('list')
  getUserList() {
    return '获取用户列表';
  }
}
