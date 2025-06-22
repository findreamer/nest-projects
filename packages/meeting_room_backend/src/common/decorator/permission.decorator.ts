import { SetMetadata } from '@nestjs/common';
import { REQUIRE_PERMISSIONS_METADATA } from '@/common/constant';

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_METADATA, permissions);
