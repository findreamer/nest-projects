import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return 'done';
  }

  @Post('register')
  register(@Body() registerUser: RegisterUserDto) {
    return this.userService.register(registerUser);
  }

  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    return this.userService.captcha(address);
  }

  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    console.log('loginUser', loginUser);
    return 'success';
  }
}
