import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Permission } from 'src/permission/entities/permission.entity';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector;
  @Inject(RoleService)
  private readonly roleService: RoleService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 切换到http类型
    const request = context.switchToHttp().getRequest<Request>();

    // 判断req.user是否存在，不存在则是 白名单 接口 放行
    if (!request.user) {
      return true;
    }

    // 获取到user对应的权限 user => roles => permissions
    const roles = await this.roleService.findRolesByIds(
      request.user.roles.map((item) => item.id),
    );

    const userPermissions = roles.reduce((prev, item) => {
      prev.push(...item.permissions);
      return prev;
    }, [] as Permission[]);

    console.log('用户拥有的权限：', userPermissions);

    // 获取到装饰器对应的权限
    const permissionRequired = this.reflector.getAllAndOverride<string[]>(
      'PermissionRequired',
      [context.getClass(), context.getHandler()],
    );

    // 接口不需要权限，直接放行
    if (!permissionRequired) {
      return true;
    }

    console.log('接口需要的权限：', permissionRequired);

    // 判断权限是否存在，不存在则直接返回无权限
    return userPermissions.some((item) => {
      return permissionRequired.includes(item.name);
    });
  }
}
