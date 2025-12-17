import { User as AppUser } from 'src/entities/user.entity';

declare global {
  namespace Express {
    // ✅ 正确：使用接口扩展，会与原始Express.User合并
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends Pick<AppUser, 'username' | 'id' | 'email'> {
      // 可以在这里添加Express特有的属性
    }

    interface Request {
      user?: User;
    }
  }
}

// 确保这是模块
export {};
