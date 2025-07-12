import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
} from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { MeetingRoom } from '@/meeting-room/entities/meeting-room.entity';
import { Booking } from './entities/booking.entity';
import { classToPlain } from 'class-transformer';
import { RedisService } from '@/redis/redis.service';
import { EmailService } from '@/email/email.service';

@Injectable()
export class BookingService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(RedisService)
  private redisServer: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1,
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 2,
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 4,
    });
    const room2 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 5,
    });

    const booking1 = new Booking();
    booking1.note = '测试会议';
    booking1.user = user1;
    booking1.room = room1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.insert(Booking, booking1);

    const booking2 = new Booking();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking3);

    const booking4 = new Booking();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking4);
  }
  async find(
    pageNo: number,
    pageSize: number,
    username: string,
    roomName: string,
    roomPosition: string,
    startTime: string,
    endTime: string,
  ) {
    const condition: FindOptionsWhere<Booking> = {};

    if (username) {
      condition.user = {
        username: Like(`%${username}%`),
      };
    }
    if (roomName) {
      condition.room = {
        name: Like(`%${roomName}%`),
      };
    }
    if (roomPosition) {
      condition.room = {
        location: Like(`%${roomPosition}%`),
      };
    }
    if (startTime) {
      condition.startTime = MoreThanOrEqual(new Date(startTime));
    }
    if (endTime) {
      condition.endTime = LessThanOrEqual(new Date(endTime));
    }

    const skipCount = (pageNo - 1) * pageSize;
    const [bookings, total] = await this.entityManager.findAndCount(Booking, {
      skip: skipCount,
      take: pageSize,
      where: condition,
      relations: {
        user: true,
        room: true,
      },
      select: {
        id: true,
        startTime: true,
        user: {
          id: true,
          nickName: true,
        },
      },
    });

    return {
      rows: bookings,
      total,
      pageNo,
      pageSize,
    };
  }

  async add(bookingDto: CreateBookingDto, userId: number) {
    const meetingRoom = await this.entityManager.findOneBy(MeetingRoom, {
      id: bookingDto.meetingRoomId,
    });
    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    const user = await this.entityManager.findOneBy(User, { id: userId });
    const booking = new Booking();

    booking.room = meetingRoom;
    booking.user = user;
    booking.startTime = new Date(bookingDto.startTime);
    booking.endTime = new Date(bookingDto.endTime);

    if (bookingDto.note) {
      booking.note = bookingDto.note;
    }

    // 查询此会议室是否在时间段被预定
    const isExit = await this.entityManager.findOneBy(Booking, {
      room: meetingRoom,
      startTime: LessThanOrEqual(booking.endTime),
      endTime: MoreThanOrEqual(booking.startTime),
    });

    if (isExit) {
      throw new BadRequestException('该时间段会议室已被预定');
    }

    await this.entityManager.insert(Booking, booking);
  }

  async apply(id: number) {
    await this.entityManager.update(Booking, id, {
      status: '审批通过',
    });

    return 'success';
  }

  async reject(id: number) {
    await this.entityManager.update(Booking, id, {
      status: '审批驳回',
    });
    return 'success';
  }

  async unbind(id: number) {
    await this.entityManager.update(Booking, id, {
      status: '已解除',
    });
    return 'success';
  }

  async urge(id: number) {
    const flag = this.redisServer.get('urge_' + id);

    if (flag) {
      throw new BadRequestException('半小时只能催办一次，请耐心等待');
    }

    let email = await this.redisServer.get('admin_email');
    if (!email) {
      const admin = await this.entityManager.findOne(User, {
        where: {
          isAdmin: true,
        },
        select: ['email'],
      });
      if (admin) {
        email = admin.email;
        await this.redisServer.set('admin_email', admin.email);
      }
    }

    this.emailService.sendMail({
      to: email,
      subject: '预定申请催办消息',
      html: `id 为 ${id} 的预定申请正在等待审批`,
    });

    this.redisServer.set('urge_' + id, '1', 60 * 30);
  }
}
