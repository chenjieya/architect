import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginJwtService } from './login-jwt.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterLoginDto } from './dto/register-login.dto';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoginGuard } from 'src/login.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';

@Controller('login-jwt')
export class LoginJwtController {
  @Inject(JwtService)
  private readonly jwt: JwtService;

  @Inject(AuthService)
  private readonly authService: AuthService;

  constructor(private readonly loginJwtService: LoginJwtService) {}

  @Post('passport-jwt-login')
  @UseGuards(AuthGuard('local'))
  passportJwtLogin(@Body() loginDto: LoginUserDto, @Req() req: Request) {
    console.log(req.user, 'user');
    return this.authService.login(loginDto);
  }

  @Post('passport-login')
  @UseGuards(AuthGuard('local'))
  passportLogin(@Req() request: Request) {
    return request.user;
  }

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

  @Get('info2')
  @UseGuards(AuthGuard('jwt'))
  getUserInfo2() {
    return '获取用户详细信息2';
  }

  @Get('list')
  getUserList() {
    return '获取用户列表';
  }
}
