import { Permission } from '@/user/entities/permission.entity';
import { ApiProperty } from '@nestjs/swagger';
export class UserInfo {
  id: number;
  @ApiProperty({
    example: 'admin',
  })
  username: string;

  @ApiProperty({
    example: '管理员',
  })
  nickName: string;

  @ApiProperty({
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty()
  headPic: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isFrozen: boolean;

  @ApiProperty()
  isAdmin: boolean;

  @ApiProperty()
  createTime: number;

  @ApiProperty()
  roles: string[];

  @ApiProperty({
    example: [
      {
        id: 1,
        name: '管理员',
        code: 'admin',
      },
    ],
  })
  permissions: Permission[];
}

export class LoginUserVo {
  @ApiProperty()
  userInfo: UserInfo;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
