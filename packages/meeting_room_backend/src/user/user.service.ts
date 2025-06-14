import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { REDIS_CLIENT } from '@/common/constant';
import { RedisClientType } from 'redis';
import { md5 } from '@/utils';
import { EmailService } from '@/email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(REDIS_CLIENT)
    private redisClient: RedisClientType,
    @Inject(EmailService)
    private emailService: EmailService,
  ) {}

  private logger = new Logger(UserService.name);

  async register(user: RegisterUserDto) {
    const captcha = await this.redisClient.get(`captcha_${user.email}`);

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (user.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const existUser = await this.userRepository.findOne({
      where: {
        username: user.username,
      },
    });

    if (existUser) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.nickName = user.nickName;
    newUser.password = md5(user.password);
    newUser.email = user.email;

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (error) {
      this.logger.error(error, UserService.name);
      return '注册失败';
    }
  }

  async captcha(address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisClient.set(`captcha_${address}`, code, {
      EX: 60 * 5,
    });
    this.logger.log(`验证码已发送到${address}`, UserService.name);
    try {
      await this.emailService.sendMail({
        to: address,
        subject: '验证码',
        html: `您的验证码是${code}`,
      });
      return '验证码已发送';
    } catch (error) {
      this.logger.error(error, UserService.name);
      return '验证码发送失败';
    }
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
