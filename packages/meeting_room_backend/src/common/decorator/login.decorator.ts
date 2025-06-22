import { SetMetadata } from '@nestjs/common';
import { REQUIRE_LOGIN_METADATA } from '@/common/constant';

export const RequireLogin = () => SetMetadata(REQUIRE_LOGIN_METADATA, true);
