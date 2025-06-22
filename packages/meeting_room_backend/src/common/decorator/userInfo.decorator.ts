import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtUserData } from '@/common/guard/login.guard';

export const UserInfo = createParamDecorator(
  (field: keyof JwtUserData, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (!req.user) {
      return null;
    }
    return field ? req.user[field] : req.user;
  },
);
