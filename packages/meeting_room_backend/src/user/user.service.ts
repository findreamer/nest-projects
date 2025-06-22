import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { REDIS_CLIENT } from '@/common/constant';
import { RedisClientType } from 'redis';
import { md5 } from '@/utils';
import { EmailService } from '@/email/email.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo, UserInfo } from './vo/login-user.vo';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserDetailVo } from './vo/user-info.vo';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(REDIS_CLIENT)
    private redisClient: RedisClientType,
    @Inject(EmailService)
    private emailService: EmailService,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private logger = new Logger(UserService.name);

  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }

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

  async login(loginUser: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginUser.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: +user.createTime,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((role) => role.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (!arr.includes(permission)) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    const { accessToken, refreshToken } = this.generateToken(vo.userInfo);
    vo.accessToken = accessToken;
    vo.refreshToken = refreshToken;

    return vo;
  }

  /**  刷新token */
  async refresh(refreshToken: string, isAdmin: boolean) {
    try {
      const data = this.jwtService.verify<{ userId: number }>(refreshToken);
      const user = await this.findUserById(data.userId, isAdmin);
      const tokens = this.generateToken(user);
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (e) {
      this.logger.error(e, UserService.name);
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  async findUserById(userId: number, isAdmin: boolean): Promise<UserInfo> {
    if (!userId) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: +user.createTime,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((role) => role.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          if (!arr.includes(permission.code)) {
            arr.push(permission.code);
          }
        });
        return arr;
      }, []),
    };
  }

  generateToken(user: UserInfo) {
    const accessToken = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires') ?? '30m',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_token_expires') ?? '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async findUserDetailById(userId: number): Promise<UserDetailVo> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      select: [
        'id',
        'username',
        'nickName',
        'email',
        'headPic',
        'phoneNumber',
        'isFrozen',
        'createTime',
      ],
    });

    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.email = user.email;
    vo.username = user.username;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.nickName = user.nickName;
    vo.createTime = user.createTime;
    vo.isFrozen = user.isFrozen;

    return vo;
  }
}
