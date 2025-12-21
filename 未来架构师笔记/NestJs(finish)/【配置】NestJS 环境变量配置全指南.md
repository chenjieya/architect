
> 在现代应用开发中，环境配置管理是区分业余项目与专业应用的重要标志。NestJS 提供了强大而灵活的配置管理方案，让你的应用能够轻松适应不同部署环境。

## 1. 为什么需要环境变量管理？

想象一下这样的场景：
- 开发环境使用本地数据库，生产环境使用云数据库
- 测试环境的 API 密钥与生产环境不同
- 不同部署区域需要不同的第三方服务配置
- 敏感信息（如数据库密码、API密钥）不能硬编码在代码中

环境变量配置就是为了解决这些问题而生，它是**现代十二要素应用方法论**的核心原则之一。

## 2. NestJS 配置模块基础

### 2.1 安装与基本使用

NestJS 提供了官方的 `@nestjs/config` 包来简化环境变量管理：

```bash
npm install @nestjs/config
```

### 2.2 基本配置

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: ['.env'], // 指定环境文件
    }),
  ],
})
export class AppModule {}
```

### 2.3 环境文件示例 (.env)

```ini
# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=mydb

# 应用配置
APP_PORT=3000
APP_ENV=development
APP_NAME=MyNestApp

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=3600s

# 第三方服务
STRIPE_API_KEY=sk_test_xxx
AWS_ACCESS_KEY_ID=AKIAxxx
AWS_SECRET_ACCESS_KEY=xxx
```

## 3. 配置验证与类型安全

### 3.1 使用 Joi 进行配置验证

防止因配置错误导致的应用崩溃：

```bash
npm install joi
npm install --save-dev @types/joi
```

```typescript
// app.module.ts
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        // 必需配置项
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        
        // 应用配置
        APP_PORT: Joi.number().port().default(3000),
        APP_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        
        // JWT配置
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('3600s'),
        
        // 可选配置
        REDIS_URL: Joi.string().optional(),
      }),
      validationOptions: {
        allowUnknown: true, // 允许未定义的变量
        abortEarly: false, // 报告所有错误而不是第一个
      },
    }),
  ],
})
export class AppModule {}
```

### 3.2 类型安全的配置服务

创建类型化的配置接口和服务：

```typescript
// config/interfaces/config.interface.ts
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface AppConfig {
  port: number;
  environment: string;
  name: string;
}

export interface RedisConfig {
  url?: string;
  ttl?: number;
}

export interface AllConfigType {
  database: DatabaseConfig;
  jwt: JwtConfig;
  app: AppConfig;
  redis: RedisConfig;
}
```

```typescript
// config/config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseConfig,
  JwtConfig,
  AppConfig,
  AllConfigType,
} from './interfaces/config.interface';

@Injectable()
export class MyConfigService {
  constructor(private configService: ConfigService) {}

  get database(): DatabaseConfig {
    return {
      host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
      port: this.configService.get<number>('DATABASE_PORT', 5432),
      username: this.configService.get<string>('DATABASE_USER', 'postgres'),
      password: this.configService.get<string>('DATABASE_PASSWORD', ''),
      database: this.configService.get<string>('DATABASE_NAME', 'test'),
    };
  }

  get jwt(): JwtConfig {
    return {
      secret: this.configService.get<string>('JWT_SECRET', 'default-secret'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '3600s'),
    };
  }

  get app(): AppConfig {
    return {
      port: this.configService.get<number>('APP_PORT', 3000),
      environment: this.configService.get<string>('APP_ENV', 'development'),
      name: this.configService.get<string>('APP_NAME', 'NestJS App'),
    };
  }

  get redis(): RedisConfig {
    return {
      url: this.configService.get<string>('REDIS_URL'),
      ttl: this.configService.get<number>('REDIS_TTL', 3600),
    };
  }
}
```

## 4. 多环境配置策略

### 4.1 基于环境的多配置文件

```
project-root/
├── src/
├── config/
│   ├── env/
│   │   ├── .env.development
│   │   ├── .env.production
│   │   ├── .env.test
│   │   └── .env.local
│   └── configuration.ts
└── package.json
```

```typescript
// config/configuration.ts
import { registerAs } from '@nestjs/config';

// 数据库配置命名空间
export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'test',
  synchronize: process.env.NODE_ENV !== 'production', // 生产环境禁用同步
  logging: process.env.NODE_ENV === 'development',
}));

// JWT配置命名空间
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
  issuer: process.env.JWT_ISSUER || 'nestjs-app',
  audience: process.env.JWT_AUDIENCE || 'nestjs-client',
}));

// 应用配置命名空间
export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'NestJS Application',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || 'api',
  version: process.env.APP_VERSION || '1.0.0',
}));

// 第三方服务配置
export const thirdPartyConfig = registerAs('thirdParty', () => ({
  stripe: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@example.com',
  },
}));
```

### 4.2 动态环境检测

```typescript
// config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import {
  databaseConfig,
  jwtConfig,
  appConfig,
  thirdPartyConfig,
} from './configuration';

// 根据 NODE_ENV 加载不同的环境文件
const envFilePath = (() => {
  const env = process.env.NODE_ENV;
  if (!env) return '.env';
  
  switch (env.toLowerCase()) {
    case 'production':
      return ['.env.production', '.env'];
    case 'test':
      return ['.env.test', '.env'];
    case 'development':
      return ['.env.development', '.env'];
    default:
      return `.env.${env}`;
  }
})();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      load: [databaseConfig, jwtConfig, appConfig, thirdPartyConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        
        // 数据库配置验证
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().port().default(5432),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        
        // 应用配置验证
        APP_PORT: Joi.number().port().default(3000),
        APP_NAME: Joi.string().default('NestJS App'),
        
        // JWT配置验证
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('3600s'),
      }),
      cache: true, // 缓存配置，提高性能
    }),
  ],
  exports: [ConfigModule],
})
export class MyConfigModule {}
```

## 5. 实际使用示例

### 5.1 在服务中使用配置

```typescript
// database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: configService.get<string>('app.environment') === 'production',
        cli: {
          migrationsDir: 'src/database/migrations',
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### 5.2 JWT 模块配置

```typescript
// auth/jwt.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
          issuer: configService.get<string>('jwt.issuer'),
          audience: configService.get<string>('jwt.audience'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [JwtModule],
})
export class JwtConfigModule {}
```

### 5.3 自定义配置服务使用

```typescript
// app.service.ts
import { Injectable } from '@nestjs/common';
import { MyConfigService } from './config/config.service';

@Injectable()
export class AppService {
  constructor(private configService: MyConfigService) {}

  getAppInfo() {
    const appConfig = this.configService.app;
    const dbConfig = this.configService.database;
    
    return {
      name: appConfig.name,
      version: appConfig.version,
      environment: appConfig.environment,
      database: {
        host: dbConfig.host,
        port: dbConfig.port,
        name: dbConfig.database,
      },
      features: {
        hasRedis: !!this.configService.redis.url,
        hasStripe: !!this.configService.get('thirdParty.stripe.apiKey'),
      },
    };
  }
}
```

## 6. 高级配置技巧

### 6.1 配置加密与敏感信息处理

```typescript
// config/encryption.util.ts
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

export class ConfigEncryption {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly ivLength = 16;
  private static readonly saltLength = 64;
  private static readonly tagLength = 16;
  
  static async encrypt(text: string, password: string): Promise<string> {
    const iv = randomBytes(this.ivLength);
    const salt = randomBytes(this.saltLength);
    
    const key = await promisify(scrypt)(password, salt, 32) as Buffer;
    const cipher = createCipheriv(this.algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    // 返回格式: salt:iv:tag:encrypted
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }
  
  static async decrypt(encryptedText: string, password: string): Promise<string> {
    const buffer = Buffer.from(encryptedText, 'base64');
    
    let offset = 0;
    const salt = buffer.slice(offset, offset + this.saltLength);
    offset += this.saltLength;
    
    const iv = buffer.slice(offset, offset + this.ivLength);
    offset += this.ivLength;
    
    const tag = buffer.slice(offset, offset + this.tagLength);
    offset += this.tagLength;
    
    const encrypted = buffer.slice(offset);
    
    const key = await promisify(scrypt)(password, salt, 32) as Buffer;
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    return decipher.update(encrypted) + decipher.final('utf8');
  }
}

// 加密敏感配置
// DATABASE_PASSWORD=encrypted:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 配置解密服务
@Injectable()
export class ConfigDecryptionService {
  private readonly encryptionKey: string;
  
  constructor(private configService: ConfigService) {
    this.encryptionKey = configService.get<string>('ENCRYPTION_KEY');
  }
  
  getDecrypted(key: string): string {
    const value = this.configService.get<string>(key);
    
    if (value?.startsWith('encrypted:')) {
      const encrypted = value.replace('encrypted:', '');
      return ConfigEncryption.decrypt(encrypted, this.encryptionKey);
    }
    
    return value;
  }
}
```

### 6.2 动态配置重载

```typescript
// config/dynamic-config.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { watch } from 'fs';
import { join } from 'path';

@Injectable()
export class DynamicConfigService implements OnModuleDestroy {
  private watcher: any;
  private configCallbacks = new Map<string, Array<(value: any) => void>>();
  
  constructor(
    private configService: ConfigService,
    private readonly envFilePath = '.env'
  ) {
    this.setupFileWatcher();
  }
  
  private setupFileWatcher() {
    const envFile = join(process.cwd(), this.envFilePath);
    
    this.watcher = watch(envFile, (eventType, filename) => {
      if (eventType === 'change') {
        this.reloadConfig();
      }
    });
    
    // 捕获进程退出信号
    process.on('SIGTERM', () => this.cleanup());
    process.on('SIGINT', () => this.cleanup());
  }
  
  private reloadConfig() {
    // 清理配置缓存
    delete require.cache[require.resolve('dotenv').resolve('.env')];
    
    // 通知所有监听器
    this.configCallbacks.forEach((callbacks, key) => {
      const newValue = this.configService.get(key);
      callbacks.forEach(callback => callback(newValue));
    });
    
    console.log('配置已重新加载');
  }
  
  // 注册配置变更监听器
  watchConfig<T>(key: string, callback: (value: T) => void) {
    if (!this.configCallbacks.has(key)) {
      this.configCallbacks.set(key, []);
    }
    this.configCallbacks.get(key).push(callback);
    
    // 返回取消监听的方法
    return () => {
      const callbacks = this.configCallbacks.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  private cleanup() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
  
  onModuleDestroy() {
    this.cleanup();
  }
}
```

### 6.3 配置文件生成器

```typescript
// scripts/generate-env.ts
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface EnvTemplate {
  [key: string]: {
    defaultValue: string;
    description: string;
    required: boolean;
    type: 'string' | 'number' | 'boolean';
  };
}

const envTemplate: EnvTemplate = {
  // 应用配置
  NODE_ENV: {
    defaultValue: 'development',
    description: '运行环境 (development, production, test)',
    required: true,
    type: 'string',
  },
  APP_PORT: {
    defaultValue: '3000',
    description: '应用端口',
    required: true,
    type: 'number',
  },
  APP_NAME: {
    defaultValue: 'NestJS Application',
    description: '应用名称',
    required: true,
    type: 'string',
  },
  
  // 数据库配置
  DATABASE_HOST: {
    defaultValue: 'localhost',
    description: '数据库主机',
    required: true,
    type: 'string',
  },
  DATABASE_PORT: {
    defaultValue: '5432',
    description: '数据库端口',
    required: true,
    type: 'number',
  },
  DATABASE_USER: {
    defaultValue: 'postgres',
    description: '数据库用户名',
    required: true,
    type: 'string',
  },
  DATABASE_PASSWORD: {
    defaultValue: '',
    description: '数据库密码',
    required: true,
    type: 'string',
  },
  DATABASE_NAME: {
    defaultValue: 'nestjs_db',
    description: '数据库名称',
    required: true,
    type: 'string',
  },
  
  // JWT配置
  JWT_SECRET: {
    defaultValue: 'change-this-secret-key',
    description: 'JWT 密钥',
    required: true,
    type: 'string',
  },
  JWT_EXPIRES_IN: {
    defaultValue: '3600s',
    description: 'JWT 过期时间',
    required: true,
    type: 'string',
  },
  
  // 可选配置
  REDIS_URL: {
    defaultValue: '',
    description: 'Redis 连接 URL',
    required: false,
    type: 'string',
  },
};

function generateEnvFile(envName: string = 'development') {
  const envDir = join(process.cwd(), 'config', 'env');
  
  // 确保目录存在
  if (!existsSync(envDir)) {
    mkdirSync(envDir, { recursive: true });
  }
  
  const lines = [
    `# ${envName.charAt(0).toUpperCase() + envName.slice(1)} 环境配置`,
    '# 自动生成，请根据需要修改\n',
  ];
  
  Object.entries(envTemplate).forEach(([key, config]) => {
    lines.push(`# ${config.description}`);
    lines.push(`# 类型: ${config.type}, 必需: ${config.required}`);
    
    if (envName === 'development' && config.required && !config.defaultValue) {
      lines.push(`# ${key}=your-${key.toLowerCase().replace(/_/g, '-')}`);
    } else {
      lines.push(`${key}=${config.defaultValue}`);
    }
    
    lines.push('');
  });
  
  const filename = `.env.${envName}`;
  const filepath = join(envDir, filename);
  
  writeFileSync(filepath, lines.join('\n'));
  console.log(`✅ 已生成配置文件: ${filepath}`);
}

// 生成所有环境配置文件
['development', 'production', 'test'].forEach(generateEnvFile);
```

## 7. 生产环境最佳实践

### 7.1 Docker 集成

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源码
COPY . .

# 设置环境变量
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# 构建应用
RUN npm run build

# 生产镜像
FROM node:18-alpine

WORKDIR /app

# 从构建阶段复制文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 更改文件所有者
RUN chown -R nestjs:nodejs /app

# 切换到非root用户
USER nestjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3000

CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      args:
        NODE_ENV: production
    environment:
      - NODE_ENV=production
      - APP_PORT=3000
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_USER=${DB_USER}
      - DATABASE_PASSWORD=${DB_PASSWORD}
      - DATABASE_NAME=${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 7.2 Kubernetes 配置

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nestjs-app-config
data:
  NODE_ENV: "production"
  APP_PORT: "3000"
  APP_NAME: "NestJS Production"
  DATABASE_HOST: "postgres-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "production_db"
  REDIS_URL: "redis://redis-service:6379"
---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: nestjs-app-secrets
type: Opaque
data:
  DATABASE_USER: cG9zdGdyZXM= # base64 encoded
  DATABASE_PASSWORD: cGFzc3dvcmQxMjM= # base64 encoded
  JWT_SECRET: c3VwZXItc2VjcmV0LWtleQ== # base64 encoded
  STRIPE_API_KEY: c2tfdGVzdF94eHg= # base64 encoded
```

### 7.3 配置验证中间件

```typescript
// config/validation.middleware.ts
import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigValidationMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}
  
  use(req: Request, res: Response, next: NextFunction) {
    // 检查必需配置
    const requiredConfigs = [
      'DATABASE_HOST',
      'DATABASE_USER', 
      'DATABASE_PASSWORD',
      'JWT_SECRET',
    ];
    
    const missingConfigs = requiredConfigs.filter(
      key => !this.configService.get(key)
    );
    
    if (missingConfigs.length > 0) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '应用配置不完整',
        missingConfigs,
        timestamp: new Date().toISOString(),
      });
    }
    
    // 检查生产环境的安全配置
    if (this.configService.get('NODE_ENV') === 'production') {
      const insecureConfigs = [];
      
      // 检查默认密码
      if (this.configService.get('DATABASE_PASSWORD') === 'password123') {
        insecureConfigs.push('DATABASE_PASSWORD 是默认密码');
      }
      
      // 检查默认 JWT 密钥
      if (this.configService.get('JWT_SECRET') === 'default-secret') {
        insecureConfigs.push('JWT_SECRET 是默认密钥');
      }
      
      if (insecureConfigs.length > 0) {
        console.warn('⚠️ 安全警告：', insecureConfigs);
        // 生产环境可以更严格地处理
        // throw new Error('不安全的配置检测到');
      }
    }
    
    next();
  }
}
```

## 8. 调试与故障排除

### 8.1 配置调试工具

```typescript
// config/debug.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigDebugService {
  private readonly logger = new Logger(ConfigDebugService.name);
  
  constructor(private configService: ConfigService) {
    this.logCurrentConfig();
  }
  
  private logCurrentConfig() {
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log('=== 当前配置信息 ===');
      
      // 安全地记录配置（隐藏敏感信息）
      const allConfig = this.configService['internalConfig'];
      const maskedConfig = this.maskSensitiveData(allConfig);
      
      Object.entries(maskedConfig).forEach(([key, value]) => {
        this.logger.log(`${key}: ${value}`);
      });
      
      this.logger.log('=== 配置信息结束 ===');
    }
  }
  
  private maskSensitiveData(config: Record<string, any>): Record<string, any> {
    const sensitiveKeys = [
      'password',
      'secret', 
      'key',
      'token',
      'auth',
      'credential',
    ];
    
    const maskedConfig = { ...config };
    
    Object.keys(maskedConfig).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        const value = String(maskedConfig[key]);
        if (value.length > 4) {
          maskedConfig[key] = value.substring(0, 2) + '***' + value.substring(value.length - 2);
        } else {
          maskedConfig[key] = '****';
        }
      }
    });
    
    return maskedConfig;
  }
  
  // 验证配置有效性
  validateConfig() {
    const errors = [];
    
    // 验证数据库连接配置
    if (!this.configService.get('DATABASE_HOST')) {
      errors.push('DATABASE_HOST 未配置');
    }
    
    // 验证端口范围
    const port = this.configService.get('APP_PORT');
    if (port && (port < 1 || port > 65535)) {
      errors.push(`APP_PORT ${port} 无效，必须在 1-65535 之间`);
    }
    
    // 验证环境变量
    const env = this.configService.get('NODE_ENV');
    const validEnvs = ['development', 'production', 'test'];
    if (env && !validEnvs.includes(env)) {
      errors.push(`NODE_ENV ${env} 无效，必须是 ${validEnvs.join(', ')} 之一`);
    }
    
    if (errors.length > 0) {
      this.logger.error('配置验证失败：', errors);
      throw new Error(`配置错误: ${errors.join('; ')}`);
    }
    
    return { valid: true, errors: [] };
  }
}
```

### 8.2 常用调试命令

```bash
# 查看当前环境变量
npm run env:list

# 验证配置文件
npm run env:validate

# 生成配置文件模板
npm run env:generate -- --env=production

# 加密敏感配置
npm run env:encrypt -- --key=your-encryption-key

# 测试配置加载
npm run start:debug -- --inspect-config
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "env:list": "node -e \"console.log('当前环境变量:'); Object.keys(process.env).forEach(key => console.log(key + ':', process.env[key]))\"",
    "env:validate": "ts-node scripts/validate-env.ts",
    "env:generate": "ts-node scripts/generate-env.ts",
    "env:encrypt": "ts-node scripts/encrypt-secrets.ts",
    "start:debug": "NODE_OPTIONS='--inspect' nest start --watch"
  }
}
```

## 9. 总结与最佳实践

### 9.1 核心要点总结

1. **分层配置管理**：使用不同的环境文件（`.env.development`、`.env.production` 等）
2. **配置验证**：使用 Joi 确保配置的完整性和正确性
3. **类型安全**：创建类型化的配置接口和服务
4. **敏感信息保护**：加密存储密码、密钥等敏感信息
5. **动态配置**：支持配置的热重载和动态更新

### 9.2 安全最佳实践

1. **永远不要将敏感信息提交到版本控制**
2. **使用环境变量而不是配置文件存储生产环境机密**
3. **实施最小权限原则**：每个服务使用独立的凭据
4. **定期轮换密钥和密码**
5. **审计日志记录所有配置访问**

### 9.3 性能优化建议

1. **配置缓存**：启用 `ConfigModule` 的缓存选项
2. **懒加载配置**：只在需要时加载配置
3. **配置预验证**：应用启动时验证所有必需配置
4. **配置压缩**：减少配置数据的大小

### 9.4 扩展建议

1. **集成配置中心**：如 Consul、etcd 或 AWS Parameter Store
2. **配置版本控制**：跟踪配置变更历史
3. **配置回滚机制**：支持快速回滚到之前的配置版本
4. **配置审计**：记录谁在何时修改了哪些配置

通过遵循这些指南，你可以构建出健壮、安全且易于维护的 NestJS 应用程序配置系统。记住，良好的配置管理是构建可靠生产应用的基础。