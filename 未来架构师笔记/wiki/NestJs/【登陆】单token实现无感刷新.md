---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. 单 Token 方案的核心思想

单 Token 方案是一种更简洁的实现方式，其核心思想是：**每次有效请求都返回一个新的 token**，从而延长用户的登录状态。

这种方式的工作流程如下：

1. 用户登录后获得一个 JWT 令牌（例如 7 天有效期）
2. **每次携带有效 token 的请求**，服务端在响应中都返回一个新的 token
3. 前端更新本地存储的 token
4. 只要用户在 7 天内至少有一次有效请求，token 就会一直刷新

## 2. 单 Token 在 NestJS 中的实现

**登录守卫中的 token 刷新逻辑**：

```typescript
// LoginGuard中的单token刷新实现
@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException("用户未登录");
    }

    try {
      const token = authorization.split(" ")[1];
      const data = this.jwtService.verify(token);

      // 每次验证成功后返回新token
      response.setHeader(
        "token",
        this.jwtService.sign(
          {
            username: data.username,
          },
          {
            expiresIn: "7d",
          }
        )
      );

      return true;
    } catch (e) {
      throw new UnauthorizedException("token失效，请重新登录");
    }
  }
}
```

**跨域访问的注意点**：

单 Token 方案中，前端需要从响应头中获取新的 token。由于浏览器的**同源策略限制**，默认情况下前端 JavaScript 只能访问部分响应头。需要在服务端设置：

```typescript
// 在NestJS中设置允许前端访问的响应头
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Expose-Headers", "token"); // 关键设置：允许前端访问token头
    next();
  }
}
```

## 3. 前端实现简单优雅

**前端拦截器处理**：

```typescript
// 前端响应拦截器处理token刷新
axios.interceptors.response.use(
  (response) => {
    const newToken = response.headers["token"];
    if (newToken) {
      localStorage.setItem("token", newToken);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

相比双 Token 方案，单 Token 的前端实现**更加简洁直观**，无需处理复杂的并发刷新逻辑。

---

## 4. 两种方案对比与选择建议

### 4.1 双 Token 方案

**优势**：

1. **安全性更高**：访问令牌有效期短，减少被盗用风险
2. **控制粒度更细**：可独立设置两种令牌的有效期
3. **行业标准**：符合 OAuth 2.0 等认证标准的设计理念

**适用场景**：

- 对安全性要求较高的金融、政务类应用
- 需要遵循行业认证标准的系统
- 支持多设备同时登录的场景

### 4.2 单 Token 方案

**优势**：

1. **实现简单**：代码量少，逻辑清晰
2. **易于维护**：不需要处理复杂的并发刷新逻辑
3. **用户体验好**：只要用户活跃，就自动保持登录状态

**适用场景**：

- 内部管理系统
- 对安全性要求相对较低的应用
- 希望快速实现无感刷新的项目

### 4.3 性能与安全考虑

| 考虑因素   | 双 Token 方案 | 单 Token 方案 |
| ---------- | ------------- | ------------- |
| 安全性     | ⭐⭐⭐⭐⭐    | ⭐⭐⭐        |
| 实现复杂度 | ⭐⭐⭐        | ⭐⭐⭐⭐⭐    |
| 维护成本   | ⭐⭐⭐        | ⭐⭐⭐⭐⭐    |
| 用户体验   | ⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐    |
| 标准符合性 | ⭐⭐⭐⭐⭐    | ⭐⭐          |

## 5. 实际应用中的最佳实践

### 5.1 Token 存储安全

无论选择哪种方案，**token 的安全存储**都至关重要：

```typescript
// 前端安全存储token的实践
class AuthService {
  // 使用安全的存储方式
  static setToken(token: string, isRefreshToken = false): void {
    const key = isRefreshToken ? "refresh_token" : "access_token";
    // 考虑使用更安全的存储方式，如HttpOnly Cookie
    localStorage.setItem(key, token);
  }

  // 考虑添加额外的安全层
  static getToken(isRefreshToken = false): string | null {
    const key = isRefreshToken ? "refresh_token" : "access_token";
    const token = localStorage.getItem(key);

    // 可在此处添加额外的安全验证
    if (!token || token.length < 10) {
      return null;
    }

    return token;
  }
}
```

### 5.2 错误处理与降级策略

**完善的错误处理机制**是提供良好用户体验的关键：

```typescript
// 完整的错误处理流程
async function handleRequestError(error, originalRequest) {
  const { response, config } = error;

  if (!response) {
    // 网络错误等
    return Promise.reject(error);
  }

  if (response.status === 401) {
    // Token过期
    return handleTokenExpired(config);
  }

  if (response.status === 403) {
    // 权限不足
    return handlePermissionDenied();
  }

  // 其他错误处理
  return Promise.reject(error);
}

async function handleTokenExpired(config) {
  try {
    // 尝试刷新token
    const newTokens = await refreshToken();

    // 更新本地token
    updateLocalTokens(newTokens);

    // 重试原始请求
    return axios(config);
  } catch (refreshError) {
    // 刷新失败，跳转到登录页
    redirectToLogin();
    return Promise.reject(refreshError);
  }
}
```

## 6. 结语

在 NestJS 中实现登录状态的无感刷新，双 Token 和单 Token 方案各有优劣。**双 Token 方案**更安全、更符合标准，适合对安全性要求高的场景；**单 Token 方案**更简洁、更易实现，适合快速开发和对用户体验要求高的内部系统。

无论选择哪种方案，关键在于理解其**核心原理和安全边界**，根据实际业务需求做出合适的选择。在实际开发中，还可以根据业务特点对这两种方案进行**组合或变体**，创造最适合自己项目的解决方案。

保持用户登录状态的连续性，同时确保系统安全性，是每个现代 Web 应用都需要面对的挑战。掌握这些实现方式，将使你在构建可靠的身份认证系统时更加得心应手。
