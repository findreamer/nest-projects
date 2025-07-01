import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MeetingRoom {
  @PrimaryGeneratedColumn({
    comment: '会议室id',
  })
  @ApiProperty()
  id: number;

  @Column({
    length: 50,
    comment: '会议室名字',
  })
  @ApiProperty()
  name: string;

  @Column({
    comment: '会议室容量',
  })
  @ApiProperty()
  capacity: number;

  @Column({
    length: 50,
    comment: '会议室位置',
  })
  @ApiProperty()
  location: string;

  @Column({
    length: 50,
    comment: '设备',
    default: '',
  })
  equipment: string;

  @Column({
    length: 100,
    comment: '描述',
    default: '',
  })
  @ApiProperty()
  description: string;

  @Column({
    comment: '是否被预订',
    default: false,
  })
  @ApiProperty()
  isBooked: boolean;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
