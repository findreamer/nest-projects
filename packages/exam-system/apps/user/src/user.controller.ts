import { Body, Controller, Inject, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { RedisService } from '@app/redis';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.create(registerUser);
  }
}
