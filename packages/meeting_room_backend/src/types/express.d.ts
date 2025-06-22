import { JwtUserData } from '@/common/guard/login.guard';

declare module 'express' {
  interface Request {
    user?: JwtUserData;
  }
}
