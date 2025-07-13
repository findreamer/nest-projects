import { Booking } from '@/booking/entities/booking.entity';
import { MeetingRoom } from '@/meeting-room/entities/meeting-room.entity';
import { User } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class StatisticService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  async userBookingCount(startTime: string, endTime: string) {
    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .select('u.id', '用户id')
      .addSelect('u.username', '用户名')
      .leftJoin(User, 'u', 'b.userId = u.id')
      .addSelect('count(1)', '预定次数')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime,
      })
      .addGroupBy('b.user')
      .getRawMany();
    return res;
  }

  async meetingRoomUsedCount(startTime: string, endTime: string) {
    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .addSelect('m.id', '会议室id')
      .addSelect('m.name', '会议室名称')
      .leftJoin(MeetingRoom, 'm', 'b.roomId = m.id')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime,
      })
      .addSelect('count(1)', '预定次数')
      .addGroupBy('b.roomId')
      .getRawMany();

    return res;
  }
}
