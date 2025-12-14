import { SetMetadata } from '@nestjs/common';

// 该装饰器定义的是 不需要 权限就能进行访问的接口
export const NoNeedPermission = () => SetMetadata('NoNeedPermission', true);
