import { PrismaService } from '@app/prisma';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private prisma: PrismaService;

  getHello(): string {
    return 'Hello World!';
  }

  async create(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({
      data: data,
      select: {
        id: true,
      },
    });
  }
}
