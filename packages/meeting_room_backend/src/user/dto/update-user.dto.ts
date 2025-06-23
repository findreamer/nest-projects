import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  headPic: string;

  @IsOptional()
  nickName: string;

  @IsOptional()
  @IsPhoneNumber('CN', {
    message: '手机号格式错误',
  })
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
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}
