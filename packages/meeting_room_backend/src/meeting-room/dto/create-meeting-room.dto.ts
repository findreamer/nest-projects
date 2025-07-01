import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class CreateMeetingRoomDto {
  @IsNotEmpty({
    message: '会议室名称不能为空',
  })
  @MaxLength(15, {
    message: '会议室名称不能超过 15 个字符',
  })
  @ApiProperty({
    description: '会议室名称',
  })
  name: string;

  @IsNotEmpty({
    message: '会议室容量不能为空',
  })
  @IsNumber(
    {},
    {
      message: '会议室容量必须是整数',
    },
  )
  @ApiProperty({
    description: '会议室容量',
  })
  capacity: number;

  @IsNotEmpty({
    message: '会议室位置不能为空',
  })
  @MaxLength(255, {
    message: '会议室位置不能超过 255 个字符',
  })
  @ApiProperty({
    description: '会议室位置',
  })
  location: string;

  @IsNotEmpty({
    message: '设备不能为空',
  })
  @MaxLength(50, {
    message: '设备最长为 50 字符',
  })
  @ApiProperty({
    description: '设备',
  })
  equipment: string;

  @IsNotEmpty({
    message: '描述不能为空',
  })
  @MaxLength(100, {
    message: '描述最长为 100 字符',
  })
  @ApiProperty({
    description: '描述',
  })
  description: string;
}
