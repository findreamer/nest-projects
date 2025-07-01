import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class MeetingRoomService {
  constructor(
    @InjectRepository(MeetingRoom)
    private readonly repository: Repository<MeetingRoom>,
  ) {}

  initData() {
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    this.repository.insert([room1, room2, room3]);
  }
  async find(
    pageNo: number,
    pageSize: number,
    name: string,
    capacity: number,
    equipment: string,
  ) {
    if (pageNo < 1) {
      throw new BadRequestException('pageNo 不能小于 1');
    }
    const skipCount = (pageNo - 1) * pageSize;
    const condition: Record<string, any> = {};

    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }
    if (capacity) {
      condition.capacity = capacity;
    }
    const [rooms, total] = await this.repository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition,
    });

    return {
      rows: rooms,
      total,
      pageNo,
      pageSize,
    };
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.repository.findOne({
      where: {
        name: meetingRoomDto.name,
      },
    });

    if (room) {
      throw new BadRequestException('会议室名称已存在');
    }

    return (await this.repository.insert(meetingRoomDto)).generatedMaps[0];
  }

  async update(updateMeetingRoomDto: UpdateMeetingRoomDto) {
    const { id, ...rest } = updateMeetingRoomDto;
    const room = await this.repository.findOne({
      where: {
        id: +id,
      },
    });

    if (!room) {
      throw new BadRequestException('会议室不存在');
    }

    // 遍历 rest 对象，只更新 MeetingRoom 模型内存在的字段
    for (const key in rest) {
      if (Object.prototype.hasOwnProperty.call(room, key)) {
        room[key] = rest[key];
      }
    }

    return (await this.repository.update(+id, room)).generatedMaps[0];
  }

  async findById(id: number) {
    return this.repository.findOneBy({ id });
  }

  async delete(id: number) {
    // todo 先判断会议室是否被预约
    const room = await this.repository.findOneBy({
      id: id,
    });

    // 如果会议室已经被订阅
    if (room.isBooked) {
      // 删除订阅
    }
    return this.repository.delete(id);
  }
}
