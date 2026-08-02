---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---
## 1. 📦 前言：构建企业级 Node.js 应用的必备依赖

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的框架。它使用渐进式 JavaScript，构建并完全支持 TypeScript。以下是一个完整 NestJS 项目所需的核心依赖集合：

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.2",
    "@nestjs/core": "^11.0.1",
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/mapped-types": "*",
    "@nestjs/passport": "^11.0.5",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/platform-socket.io": "^11.1.9",
    "@nestjs/typeorm": "^11.0.0",
    "@nestjs/websockets": "^11.1.9",
    "@types/express-session": "^1.18.2",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.3",
    "express-session": "^1.18.2",
    "md5": "^2.3.0",
    "multer": "^2.0.2",
    "mysql2": "^3.15.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "redis": "^5.10.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "socket.io": "^4.8.1",
    "typeorm": "^0.3.28"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@eslint/js": "^9.18.0",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "@types/express": "^5.0.0",
    "@types/jest": "^30.0.0",
    "@types/multer": "^2.0.0",
    "@types/node": "^22.10.7",
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-local": "^1.0.38",
    "@types/supertest": "^6.0.2",
    "eslint": "^9.18.0",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2",
    "globals": "^16.0.0",
    "jest": "^30.0.0",
    "prettier": "^3.4.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.2",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.7.3",
    "typescript-eslint": "^8.20.0"
  }
}
```

## 2. 🏗️ NestJS 核心框架依赖

### 2.1 @nestjs/common、@nestjs/core

这是 NestJS 框架的核心模块，提供了装饰器、HTTP 异常过滤器、管道、守卫、拦截器等基础功能。

##### 作用
- **@nestjs/common**: 提供装饰器、HTTP 状态码、异常类等基础工具
- **@nestjs/core**: NestJS 应用运行时的核心引擎

##### 基本配置

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

##### 关键特性
- **模块化系统**: 支持模块化组织代码
- **依赖注入**: 强大的依赖注入容器
- **装饰器支持**: 全面的装饰器语法糖
- **生命周期钩子**: onModuleInit、onApplicationBootstrap 等

### 2.2 @nestjs/platform-express

NestJS 默认使用 Express 作为底层 HTTP 服务器，此包提供了 Express 适配器。

##### 作用
将 NestJS 应用与 Express 框架桥接，使 NestJS 能够处理 HTTP 请求。

```typescript
// 自定义 Express 配置
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 使用 Express 实例
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  
  await app.listen(3000);
}
```

## 3. 🔐 安全与认证依赖

### 3.1 @nestjs/jwt、@nestjs/passport

提供了 JWT 认证和 Passport 策略集成，用于构建安全的身份验证系统。

##### 安装与配置

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [JwtStrategy, LocalStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
```

##### 常用配置选项
```typescript
JwtModule.register({
  secret: 'your-secret-key',
  signOptions: {
    expiresIn: '24h',
    algorithm: 'HS256',
  },
  verifyOptions: {
    ignoreExpiration: false,
  },
});
```

### 3.2 passport、passport-jwt、passport-local

Passport 身份验证中间件及其策略实现。

##### 策略配置示例

```typescript
// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
```

```typescript
// local.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### 3.3 express-session

会话管理中间件，用于处理用户会话。

##### 配置示例
```typescript
import * as session from 'express-session';
import * as redisStore from 'connect-redis';
import Redis from 'redis';

// main.ts 中配置
app.use(
  session({
    store: new (redisStore(session))({
      client: redis.createClient({ url: process.env.REDIS_URL }),
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24小时
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  }),
);
```

## 4. 💾 数据库与ORM依赖

### 4.1 @nestjs/typeorm、typeorm、mysql2

TypeORM 集成和 MySQL 数据库驱动。

##### 安装配置

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class AppModule {}
```

##### 实体定义示例
```typescript
// user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

### 4.2 redis

Redis 客户端，用于缓存、会话存储和消息队列。

##### 基本使用
```typescript
// redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = Redis.createClient({
      url: process.env.REDIS_URL,
    });
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
    if (ttl) {
      await this.client.expire(key, ttl);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
```

## 5. 📝 数据验证与转换

### 5.1 class-validator、class-transformer

数据验证和类转换工具，用于 DTO 验证和序列化。

##### DTO 验证示例
```typescript
// create-user.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  role?: string;
}
```

##### 在控制器中使用
```typescript
// user.controller.ts
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  createUser(@Body() createUserDto: CreateUserDto) {
    // 数据已自动验证和转换
    return this.userService.create(createUserDto);
  }
}
```

### 5.2 @nestjs/mapped-types

基于现有 DTO 创建变体类型，减少重复代码。

##### 使用示例
```typescript
import { PartialType, PickType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// 创建部分更新 DTO（所有字段可选）
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// 只选择特定字段
export class UserLoginDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}

// 排除特定字段
export class UserPublicDto extends OmitType(CreateUserDto, ['password'] as const) {}
```

## 6. 📁 文件上传处理

### 6.1 multer、@types/multer

文件上传中间件，用于处理 multipart/form-data。

##### 配置示例
```typescript
// file-upload.config.ts
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
};
```

##### 在控制器中使用
```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
```

## 7. ⚙️ 配置管理

### 6.1 @nestjs/config

应用程序配置管理，支持环境变量、配置文件等。

##### 基本配置
```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
  ],
})
export class AppModule {}
```

##### 在服务中使用配置
```typescript
// database.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {}

  getConnectionConfig() {
    return {
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      database: this.configService.get<string>('DB_NAME'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
    };
  }
}
```

## 8. 🧪 测试相关依赖

### 7.1 @nestjs/testing、jest、supertest

单元测试和端到端测试工具。

##### 单元测试示例
```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  
  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUsername', () => {
    it('should return a user', async () => {
      const mockUser = { id: 1, username: 'test' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('test');
      expect(result).toEqual(mockUser);
    });
  });
});
```

##### 端到端测试示例
```typescript
// app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
```

## 9. 🛠️ 开发工具依赖

### 9.1 @nestjs/cli、typescript、ts-node

NestJS CLI 工具和 TypeScript 编译工具。

##### 常用 CLI 命令
```bash
# 创建新项目
nest new project-name

# 生成模块
nest generate module users

# 生成控制器
nest generate controller users

# 生成服务
nest generate service users

# 生成守卫
nest generate guard auth

# 生成过滤器
nest generate filter http-exception

# 生成中间件
nest generate middleware logger

# 生成拦截器
nest generate interceptor transform

# 生成管道
nest generate pipe validation
```

### 9.2 eslint、prettier、typescript-eslint

代码质量检查和格式化工具。

##### ESLint 配置示例 (.eslintrc.js)
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

##### Prettier 配置示例 (.prettierrc)
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

## 10. 📦 其他实用依赖

### 10.1 rxjs

响应式编程库，NestJS 的 Observable 流处理基础。

```typescript
import { Observable, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable()
export class NotificationService {
  sendPeriodicNotifications(): Observable<string> {
    return interval(1000).pipe(
      take(10),
      map(value => `Notification ${value + 1}`)
    );
  }
}
```

### 10.2 md5

简单的哈希函数库，用于密码哈希等场景。

```typescript
import * as md5 from 'md5';

@Injectable()
export class PasswordService {
  hashPassword(password: string): string {
    const salt = process.env.PASSWORD_SALT;
    return md5(password + salt);
  }

  verifyPassword(inputPassword: string, hashedPassword: string): boolean {
    const salt = process.env.PASSWORD_SALT;
    return md5(inputPassword + salt) === hashedPassword;
  }
}
```

### 10.3 source-map-support

开发调试支持，提供准确的错误堆栈信息。

```json
// package.json
{
  "scripts": {
    "start:dev": "nodemon --config nodemon.json",
    "start:debug": "nodemon --config nodemon.json --inspect"
  }
}
```

```json
// nodemon.json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "node -r ts-node/register -r source-map-support/register src/main.ts"
}
```

## 11. 🎯 最佳实践总结

1. **环境配置**: 使用 `@nestjs/config` 管理不同环境配置
2. **数据验证**: 使用 `class-validator` 和 `class-transformer` 处理请求数据
3. **身份认证**: 结合 `@nestjs/jwt` 和 `passport` 实现安全认证
4. **数据库操作**: 使用 `@nestjs/typeorm` 进行数据库交互
5. **缓存策略**: 使用 `redis` 提升应用性能
6. **文件上传**: 使用 `multer` 处理文件上传
7. **测试覆盖**: 使用 `@nestjs/testing` 和 `jest` 确保代码质量
8. **代码规范**: 使用 `eslint` 和 `prettier` 保持代码一致性

这套依赖配置覆盖了 NestJS 企业级应用开发的各个方面，从核心框架到安全认证，从数据库操作到测试覆盖，为构建可维护、可扩展的 Node.js 应用提供了完整的工具链支持。