import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserInfo } from '@/user/vo/login-user.vo';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUIRE_LOGIN_METADATA } from '../constant/metadata';

export type JwtUserData = Pick<
  UserInfo,
  'username' | 'roles' | 'permissions'
> & {
  userId: number;
};

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 使用 reflector 从目标controller 和 handler 上获取 require-login 的 metadata
    // 如果没有 metadata 说明不需要登录， 直接返回 true
    const requireLogin = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_LOGIN_METADATA,
      [context.getClass(), context.getHandler()],
    );

    // 不需要登录
    if (!requireLogin) {
      return true;
    }

    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new UnauthorizedException('用户未登录');
    }
    try {
      const token = authorization.split(' ')[1];
      const user = this.jwtService.verify<JwtUserData>(token);
      request.user = user;
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException('token 失效， 请重新登录');
    }
  }
}
