import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty()
  headPic: string;

  @IsOptional()
  @ApiProperty()
  nickName: string;

  @IsOptional()
  @IsPhoneNumber('CN', {
    message: '手机号格式错误',
  })
  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式',
    },
  )
  @ApiProperty({
    description: '邮箱',
  })
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  @ApiProperty({
    description: '验证码',
  })
  captcha: string;
}
