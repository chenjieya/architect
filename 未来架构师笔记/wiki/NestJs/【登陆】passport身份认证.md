---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 在现代化的 Web 应用中，身份认证是实现用户权限管理的核心环节。NestJS 结合 Passport 库，为开发者提供了一套优雅而强大的解决方案。

本文将系统性地介绍如何在 NestJS 中使用 Passport 实现多种身份认证策略，涵盖本地认证、JWT 认证以及 GitHub 和 Google 的第三方登录，为你的应用安全保驾护航。

## 1. 理解 Passport 的设计哲学与策略模式

在深入研究代码实现之前，我们首先要理解 Passport 库的核心设计思想。

### 1.1 策略模式：认证的通用解决方案

身份认证的本质是什么？无论是用户名密码登录、JWT 验证还是第三方 OAuth 认证，它们的核心流程都遵循一个**通用模式**：

1. 从请求中提取认证信息（如 body 中的 username/password、header 中的 token、session 中的状态）
2. 验证这些信息的有效性
3. 认证成功后，将用户信息附加到请求对象上（通常是`req.user`）

这正是**策略模式**的绝佳应用场景：将每种认证方式的实现封装为独立的策略类，它们遵循相同的接口，可以互相替换。

### 1.2 Passport 的策略生命周期

Passport 的每种策略都遵循一致的生命周期：

- **配置阶段**：初始化策略时设置提取认证信息的规则（如从何处提取 token、需要的密钥等）
- **验证阶段**：提取到的信息传递给`validate`方法，开发者在此实现具体的业务验证逻辑
- **会话管理**：验证成功后，Passport 自动将返回的用户信息附加到`req.user`

理解了这一架构，我们就能以统一的思维模式掌握所有 Passport 策略的使用方法。

---

## 2. 本地策略与 JWT 认证实现

### 2.1 项目初始化与基础配置

首先创建 NestJS 项目并安装必要依赖：

```bash
nest new nest-passport
npm install --save @nestjs/passport passport passport-local @nestjs/jwt
npm install --save-dev @types/passport-local @types/passport-jwt
```

### 2.2 本地策略（用户名密码认证）

**1. 创建本地策略**

```typescript
// auth/local.strategy.ts
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // 默认情况下，Passport-local期望请求体中有"username"和"password"字段
    // 如果需要自定义字段名，可以传入配置对象：
    // super({ usernameField: 'email', passwordField: 'pass' })
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    // 此方法由Passport自动调用
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException("用户名或密码错误");
    }
    // 返回值会被Passport自动附加到req.user
    return user;
  }
}
```

**2. 实现验证服务**

```typescript
// auth/auth.service.ts
import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(username: string, password: string): Promise<any> {
    // 1. 查询用户是否存在
    const user = await this.userService.findOne(username);
    if (!user) return null;

    // 2. 验证密码（实际项目中应使用加密比较）
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === user.password;

    if (!isPasswordValid) return null;

    // 3. 返回用户信息（排除敏感字段）
    const { password: _, ...result } = user;
    return result;
  }
}
```

**3. 创建认证模块**

```typescript
// auth/auth.module.ts
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./local.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

**4. 在控制器中使用本地策略**

```typescript
// app.controller.ts
import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth/auth.service";
import { JwtService } from "@nestjs/jwt";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  // 使用本地策略保护登录端点
  @UseGuards(AuthGuard("local"))
  @Post("login")
  async login(@Request() req) {
    // 用户已验证，req.user包含validate方法返回的信息
    const payload = {
      sub: req.user.id,
      username: req.user.username,
    };

    // 生成JWT令牌
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: req.user,
    };
  }
}
```

### 2.3 JWT 策略（令牌认证）

**1. 创建 JWT 策略**

```typescript
// auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      // 指定从何处提取JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 如果设置为true，令牌过期不会导致验证失败
      ignoreExpiration: false,
      // 用于验证令牌签名的密钥
      secretOrKey: process.env.JWT_SECRET || "your-secret-key",
    });
  }

  async validate(payload: any) {
    // payload是解码后的JWT内容
    // 通常包含用户标识符（如sub或userId）
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException("用户不存在或令牌无效");
    }

    // 返回的用户信息会被附加到req.user
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };
  }
}
```

**2. 创建自定义守卫以实现灵活控制**

实际项目中，我们通常需要更精细的访问控制，比如某些接口公开访问，某些需要认证：

```typescript
// auth/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 检查是否标记为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 否则执行JWT认证
    return super.canActivate(context);
  }
}
```

**3. 创建公开装饰器**

```typescript
// decorators/public.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**4. 全局注册 JWT 守卫**

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 全局启用JWT认证
    },
  ],
})
export class AppModule {}
```

**5. 在控制器中使用**

```typescript
// app.controller.ts
import { Controller, Get, UseGuards } from "@nestjs/common";
import { Public } from "./decorators/public.decorator";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Controller()
export class AppController {
  @Public() // 此端点公开访问
  @Get("public")
  getPublicData() {
    return { message: "这是公开数据" };
  }

  // 由于JwtAuthGuard已全局注册，此端点默认需要认证
  @Get("profile")
  getProfile(@Request() req) {
    return { user: req.user }; // req.user由JwtStrategy填充
  }
}
```

### 2.4 类型安全增强

为了获得更好的 TypeScript 支持，可以扩展 Express 的 Request 类型：

```typescript
// types/express.d.tsexpress.d.ts
import { User } from "../user/user.entity";

declare global {
  namespace Express {
    interface Request {
      user?: User; // 或者你的用户类型
    }
  }
}
```

---

## 3. GitHub 第三方登录实现

### 3.1 OAuth 2.0 与第三方登录流程

第三方登录基于 OAuth 2.0 授权框架，其核心流程如下：

1. **授权请求**：用户点击"使用 GitHub 登录"，应用将用户重定向到 GitHub 授权页面
2. **用户授权**：用户在 GitHub 上登录并授权应用访问其信息
3. **授权回调**：GitHub 将用户重定向回应用，附带授权码
4. **令牌交换**：应用使用授权码向 GitHub 交换访问令牌
5. **获取用户信息**：应用使用访问令牌获取用户基本信息

### 3.2 GitHub OAuth 应用注册

1. 访问 GitHub Settings → Developer settings → OAuth Apps
2. 点击"New OAuth App"
3. 填写应用信息：
   - **Application name**：你的应用名称
   - **Homepage URL**：你的应用主页
   - **Authorization callback URL**：`http://localhost:3000/auth/github/callback`
4. 注册后获取`Client ID`和`Client Secret`

### 3.3 实现 GitHub 登录策略

**1. 安装依赖**

```bash
npm install --save passport-github2
npm install --save-dev @types/passport-github2
```

**2. 创建 GitHub 策略**

```typescript
// auth/github.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-github2";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL}/auth/github/callback`,
      scope: ["user:email"], // 请求访问用户邮箱的权限
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function
  ) {
    // profile包含GitHub用户信息
    const { id, username, displayName, photos, emails } = profile;

    const user = {
      githubId: id,
      username: username || displayName,
      email: emails?.[0]?.value,
      avatar: photos?.[0]?.value,
      accessToken, // 可用于后续API调用
    };

    // 查找或创建用户
    const existingUser = await this.userService.findByGithubId(id);

    if (existingUser) {
      return done(null, existingUser);
    }

    // 新用户：创建账户
    const newUser = await this.userService.createFromGithub(user);
    return done(null, newUser);
  }
}
```

**3. 创建用户服务方法**

```typescript
// user/user.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { githubId } });
  }

  async createFromGithub(githubData: any): Promise<User> {
    const user = new User();
    user.githubId = githubData.githubId;
    user.username = githubData.username;
    user.email = githubData.email;
    user.avatar = githubData.avatar;
    user.authProvider = "github"; // 标记认证来源

    return this.userRepository.save(user);
  }
}
```

**4. 创建认证控制器**

```typescript
// auth/auth.controller.ts
import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";

@Controller("auth")
export class AuthController {
  constructor(private jwtService: JwtService) {}

  // 启动GitHub认证流程
  @Get("github")
  @UseGuards(AuthGuard("github"))
  githubAuth() {
    // 此方法体为空，Passport会自动处理重定向
  }

  // GitHub认证回调
  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    // req.user包含validate方法返回的用户信息

    // 生成JWT
    const payload = { sub: req.user.id, username: req.user.username };
    const jwt = this.jwtService.sign(payload);

    // 方案1：重定向到前端并传递令牌
    // res.redirect(`http://frontend.com/auth-success?token=${jwt}`);

    // 方案2：设置HTTP-only Cookie（更安全）
    res.cookie("access_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1天
    });

    // 重定向到应用首页
    res.redirect("http://frontend.com/dashboard");
  }
}
```

### 3.4 前端集成示例

```javascript
// 前端React组件
import React from "react";

const LoginPage = () => {
  const handleGithubLogin = () => {
    // 重定向到GitHub认证端点
    window.location.href = "http://localhost:3000/auth/github";
  };

  return (
    <div>
      <button onClick={handleGithubLogin}>使用GitHub登录</button>
    </div>
  );
};

export default LoginPage;
```

---

## 4. Google 第三方登录实现

### 4.1 Google OAuth 2.0 配置

1. 访问[Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 导航到"APIs & Services" → "Credentials"
4. 点击"Create Credentials" → "OAuth client ID"
5. 配置 OAuth 同意屏幕：
   - 应用类型：通常选择"External"
   - 填写应用名称、用户支持邮箱等
6. 创建 OAuth 2.0 客户端 ID：
   - 应用类型：Web 应用
   - 添加授权来源：`http://localhost:3000`
   - 添加授权重定向 URI：`http://localhost:3000/auth/google/callback`
7. 获取`Client ID`和`Client Secret`

### 4.2 实现 Google 登录策略

**1. 安装依赖**

```bash
npm install --save passport-google-oauth20
npm install --save-dev @types/passport-google-oauth20
```

**2. 创建 Google 策略**

```typescript
// auth/google.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL}/auth/google/callback`,
      scope: ["email", "profile"], // 请求访问邮箱和基本资料
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) {
    const { id, displayName, emails, photos } = profile;

    const user = {
      googleId: id,
      email: emails[0].value,
      name: displayName,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      avatar: photos?.[0]?.value,
      accessToken,
    };

    // 查找或创建用户
    const existingUser = await this.userService.findByEmail(user.email);

    if (existingUser) {
      // 更新现有用户的Google信息
      existingUser.googleId = user.googleId;
      existingUser.avatar = user.avatar;
      await this.userService.update(existingUser);
      return done(null, existingUser);
    }

    // 新用户：创建账户
    const newUser = await this.userService.create({
      email: user.email,
      username: user.email.split("@")[0],
      name: user.name,
      googleId: user.googleId,
      avatar: user.avatar,
      authProvider: "google",
      isActive: true,
    });

    return done(null, newUser);
  }
}
```

**3. 增强用户实体以支持多认证源**

```typescript
// user/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  passwordHash: string; // 仅用于本地登录

  @Column({ nullable: true })
  googleId: string; // Google用户ID

  @Column({ nullable: true })
  githubId: string; // GitHub用户ID

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: "enum",
    enum: ["local", "google", "github"],
    default: "local",
  })
  authProvider: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
```

**4. 创建认证控制器**

```typescript
// auth/auth.controller.ts
import { Controller, Get, Req, Res, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth() {
    // 自动重定向到Google登录页面
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthCallback(
    @Req() req,
    @Res() res: Response,
    @Query("state") state: string
  ) {
    // 解析状态参数（可用于传递重定向URL）
    const redirectUrl = state ? decodeURIComponent(state) : "/dashboard";

    // 生成JWT
    const payload = {
      sub: req.user.id,
      email: req.user.email,
      provider: req.user.authProvider,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: "7d",
    });

    // 根据环境选择令牌传递方式
    if (process.env.NODE_ENV === "production") {
      // 生产环境：使用HTTP-only Cookie
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      });
    } else {
      // 开发环境：可以传递到前端URL
      res.redirect(`http://localhost:3001/auth-success?token=${token}`);
    }

    // 重定向到应用
    res.redirect(`http://frontend.com${redirectUrl}`);
  }
}
```

### 4.3 统一第三方登录处理

**创建统一的用户服务**

```typescript
// user/user.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

export interface OAuthUserData {
  email: string;
  provider: "google" | "github";
  providerId: string;
  name?: string;
  avatar?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findOrCreateFromOAuth(data: OAuthUserData): Promise<User> {
    // 尝试通过邮箱查找用户
    let user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (user) {
      // 用户存在，更新第三方登录信息
      if (data.provider === "google") {
        user.googleId = data.providerId;
      } else if (data.provider === "github") {
        user.githubId = data.providerId;
      }

      if (data.avatar && !user.avatar) {
        user.avatar = data.avatar;
      }

      user.authProvider = data.provider;
      return this.userRepository.save(user);
    }

    // 新用户：创建账户
    user = new User();
    user.email = data.email;
    user.username = data.email.split("@")[0];

    if (data.provider === "google") {
      user.googleId = data.providerId;
    } else if (data.provider === "github") {
      user.githubId = data.providerId;
    }

    user.avatar = data.avatar;
    user.authProvider = data.provider;
    user.isActive = true;

    return this.userRepository.save(user);
  }
}
```

---

## 5. 安全最佳实践与生产环境配置

### 5.1 环境变量管理

永远不要在代码中硬编码密钥，使用环境变量或配置管理：

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.GITHUB_CALLBACK_URL,
    },
  },
});
```

### 5.2 会话安全增强

```typescript
// 增强的JWT配置
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: "1h",
    issuer: "your-app-name",
    audience: "your-app-client",
  },
});

// 增强的Cookie配置
res.cookie("auth_token", token, {
  httpOnly: true, // 防止XSS攻击
  secure: process.env.NODE_ENV === "production", // 仅HTTPS
  sameSite: "strict", // 防止CSRF攻击
  maxAge: 24 * 60 * 60 * 1000, // 过期时间
  path: "/",
});
```

### 5.3 速率限制与暴力破解防护

```typescript
import { RateLimiterGuard } from '@nestjs/throttler';

// 在认证相关端点添加速率限制
@UseGuards(RateLimiterGuard)
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // 登录逻辑
}

// 配置速率限制
ThrottlerModule.forRoot({
  ttl: 60, // 时间窗口（秒）
  limit: 10, // 每个时间窗口内的最大请求数
});
```

### 5.4 跨域资源共享（CORS）配置

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true, // 允许传递Cookie
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.listen(3000);
}
bootstrap();
```

## 6. 总结

通过本指南，我们系统性地掌握了在 NestJS 中使用 Passport 实现多种身份认证策略的方法：

1. **本地策略**：处理传统的用户名密码登录
2. **JWT 策略**：实现无状态的 API 认证
3. **GitHub 策略**：集成 GitHub OAuth 2.0 第三方登录
4. **Google 策略**：集成 Google OAuth 2.0 第三方登录

Passport 的强大之处在于其**一致的架构模式**和**丰富的策略生态系统**。无论你需要实现何种认证方式，都能找到对应的 Passport 策略或轻松创建自定义策略。

在实际项目中，你可以根据需求混合使用这些策略，为不同用户提供灵活的登录选项。同时，通过 JWT 令牌机制，你可以在前端 SPA、移动应用和 API 服务之间实现统一的无状态认证。

记住，安全是一个持续的过程。除了正确实现认证逻辑外，还需要关注 HTTPS 强制、输入验证、会话管理、日志记录等多个安全层面，才能构建出真正安全可靠的应用系统。
