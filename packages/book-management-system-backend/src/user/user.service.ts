import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { DbService } from 'src/db/db.service';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  @Inject(DbService)
  dbService: DbService;

  async register(registerUserDto: RegisterUserDto) {
    const users: User[] = (await this.dbService.read()) ?? [];

    const foundUser = users.find(
      (item) => item.username === registerUserDto.username,
    );

    if (foundUser) {
      throw new BadRequestException('User already exists');
    }

    const user = new User();
    user.username = registerUserDto.username;
    user.password = registerUserDto.password;
    users.push(user);

    console.log(user, registerUserDto.username);

    await this.dbService.write(users);
    return user;
  }

  async login(loginUserDto: LoginUserDto) {
    const users: User[] = (await this.dbService.read()) ?? [];
    const foundUser = users.find(
      (item) => item.username === loginUserDto.username,
    );
    if (!foundUser) {
      throw new BadRequestException('User not found');
    }
    if (foundUser.password !== loginUserDto.password) {
      throw new BadRequestException('Invalid password');
    }
    return foundUser;
  }
}
