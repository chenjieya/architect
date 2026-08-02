---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> 登录状态管理是现代Web应用的核心功能之一，今天我们来深入探讨两种在NestJS中实现登录状态无感刷新的方案。

## 1. 双Token方案的核心机制

双Token方案是现代应用中广泛采用的登录状态管理方式，其核心思想是使用两种不同生命周期的令牌：

- **access_token（访问令牌）**：用于身份认证，生命周期较短（通常30分钟）
- **refresh_token（刷新令牌）**：用于获取新的访问令牌，生命周期较长（通常7天）

这种设计的**本质优势**在于安全性：即使访问令牌被盗，攻击者也只能在短时间内使用它；而刷新令牌虽然有效期较长，但不能直接用于访问受保护资源。

## 2. 双Token在NestJS中的实现

**登录接口的实现**：

```typescript
// UserController中的登录接口
@Post('login')
async login(@Body() loginUser: LoginUserDto) {
    const user = await this.userService.login(loginUser);
    
    const access_token = this.jwtService.sign(
        {
            userId: user.id,
            username: user.username,
        },
        {
            expiresIn: '30m'
        }
    );
    
    const refresh_token = this.jwtService.sign(
        {
            userId: user.id
        },
        {
            expiresIn: '7d'
        }
    );
    
    return { access_token, refresh_token };
}
```

这里的设计思路是：
- access_token包含更多用户信息（如username）
- refresh_token仅包含必要信息（如userId），减少敏感数据暴露

**刷新令牌接口的实现**：

```typescript
// UserController中的刷新令牌接口
@Get('refresh')
async refresh(@Query('refresh_token') refreshToken: string) {
    try {
        const data = this.jwtService.verify(refreshToken);
        const user = await this.userService.findUserById(data.userId);
        
        // 重新生成两个令牌
        const access_token = this.jwtService.sign(
            {
                userId: user.id,
                username: user.username,
            },
            {
                expiresIn: '30m'
            }
        );
        
        const refresh_token = this.jwtService.sign(
            {
                userId: user.id
            },
            {
                expiresIn: '7d'
            }
        );
        
        return { access_token, refresh_token };
    } catch(e) {
        throw new UnauthorizedException('token已失效，请重新登录');
    }
}
```

## 3. 前端无感刷新的实现技巧

前端需要处理的关键场景是：当access_token过期时，**自动使用refresh_token刷新**而不中断用户操作。

**并发请求的优化处理**：

```typescript
// 处理并发请求的token刷新
interface PendingTask {
  config: AxiosRequestConfig
  resolve: Function
}

let refreshing = false;
const queue: PendingTask[] = [];

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    let { data, config } = error.response;
    
    // 如果已经在刷新token，将请求加入队列等待
    if(refreshing) {
      return new Promise((resolve) => {
          queue.push({ config, resolve });
      });
    }
    
    if (data.statusCode === 401 && !config.url.includes('/user/refresh')) {
        refreshing = true;
        const res = await refreshToken();
        refreshing = false;
        
        if(res.status === 200) {
          // 刷新成功后，重新执行队列中的所有请求
          queue.forEach(({config, resolve}) => {
              resolve(axios(config));
          });
          
          return axios(config);
        } else {
          alert('登录过期，请重新登录');
          return Promise.reject(res.data);
        }
    } else {
      return error.response;
    }
  }
);
```

这个方案的精妙之处在于：**避免多个并发请求同时触发多次token刷新**。通过一个队列机制，确保同一时间只有一个刷新请求发出，其他请求则等待刷新完成。

## 4. 两种方案对比与选择建议

### 4.1 双Token方案

**优势**：
1. **安全性更高**：访问令牌有效期短，减少被盗用风险
2. **控制粒度更细**：可独立设置两种令牌的有效期
3. **行业标准**：符合OAuth 2.0等认证标准的设计理念

**适用场景**：
- 对安全性要求较高的金融、政务类应用
- 需要遵循行业认证标准的系统
- 支持多设备同时登录的场景

### 4.2 单Token方案

**优势**：
1. **实现简单**：代码量少，逻辑清晰
2. **易于维护**：不需要处理复杂的并发刷新逻辑
3. **用户体验好**：只要用户活跃，就自动保持登录状态

**适用场景**：
- 内部管理系统
- 对安全性要求相对较低的应用
- 希望快速实现无感刷新的项目

### 4.3 性能与安全考虑

| 考虑因素 | 双Token方案 | 单Token方案 |
|---------|------------|------------|
| 安全性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 实现复杂度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 维护成本 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 用户体验 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 标准符合性 | ⭐⭐⭐⭐⭐ | ⭐⭐ |

## 5. 实际应用中的最佳实践

### 5.1 Token存储安全

无论选择哪种方案，**token的安全存储**都至关重要：

```typescript
// 前端安全存储token的实践
class AuthService {
  // 使用安全的存储方式
  static setToken(token: string, isRefreshToken = false): void {
    const key = isRefreshToken ? 'refresh_token' : 'access_token';
    // 考虑使用更安全的存储方式，如HttpOnly Cookie
    localStorage.setItem(key, token);
  }
  
  // 考虑添加额外的安全层
  static getToken(isRefreshToken = false): string | null {
    const key = isRefreshToken ? 'refresh_token' : 'access_token';
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

在NestJS中实现登录状态的无感刷新，双Token和单Token方案各有优劣。**双Token方案**更安全、更符合标准，适合对安全性要求高的场景；**单Token方案**更简洁、更易实现，适合快速开发和对用户体验要求高的内部系统。

无论选择哪种方案，关键在于理解其**核心原理和安全边界**，根据实际业务需求做出合适的选择。在实际开发中，还可以根据业务特点对这两种方案进行**组合或变体**，创造最适合自己项目的解决方案。

保持用户登录状态的连续性，同时确保系统安全性，是每个现代Web应用都需要面对的挑战。掌握这些实现方式，将使你在构建可靠的身份认证系统时更加得心应手。