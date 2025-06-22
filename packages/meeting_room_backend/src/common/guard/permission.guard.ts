import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { REQUIRE_PERMISSIONS_METADATA } from '../constant';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.user) {
      return true;
    }

    const permissions = request.user.permissions.map((item) => item.code);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    for (let i = 0; i < requiredPermissions.length; i++) {
      const curPer = requiredPermissions[i];
      const hasPermission = permissions.includes(curPer);
      if (!hasPermission) {
        throw new UnauthorizedException('您没有访问接口的权限');
      }
    }

    return true;
  }
}
