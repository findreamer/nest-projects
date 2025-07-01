import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import {
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { MeetingRoom } from './entities/meeting-room.entity';
import { PageListVo } from '@/common/vo/page-list.vo';

@ApiTags('会议室')
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Get('list')
  @ApiQuery({
    name: 'pageNo',
    description: '分页页码',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '分页大小',
    type: Number,
  })
  @ApiResponse({
    type: PageListVo<MeetingRoom>,
    description: '会议室列表',
  })
  @ApiOperation({
    summary: '会议室列表',
  })
  async list(
    @Query('pageNo', new DefaultValuePipe(1), ParseIntPipe) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('equipment') equipment: string,
  ) {
    return this.meetingRoomService.find(
      pageNo,
      pageSize,
      name,
      capacity,
      equipment,
    );
  }

  @ApiBody({
    type: CreateMeetingRoomDto,
    description: '创建会议室',
  })
  @ApiOperation({
    summary: '创建会议室',
  })
  @ApiResponse({
    type: MeetingRoom,
    description: '创建成功',
  })
  @Post('create')
  async create(@Body() meetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingRoomService.create(meetingRoomDto);
  }

  @ApiOperation({
    summary: '更新会议室',
  })
  @ApiBody({
    type: UpdateMeetingRoomDto,
    description: '更新会议室',
  })
  @ApiResponse({
    type: String,
    description: '更新成功',
  })
  @Put('update')
  async update(@Body() meetingRoomDto: UpdateMeetingRoomDto) {
    return this.meetingRoomService.update(meetingRoomDto);
  }

  @ApiOperation({
    summary: '根据id获取会议室',
  })
  @ApiResponse({
    type: MeetingRoom,
    description: '获取成功',
  })
  @ApiParam({
    name: 'id',
    description: '会议室id',
    type: Number,
  })
  @ApiResponse({
    type: MeetingRoom,
    description: '获取成功',
  })
  @Get(':id')
  async find(@Param('id', ParseIntPipe) id: number) {
    return this.meetingRoomService.findById(id);
  }

  @ApiOperation({
    summary: '根据id删除会议室',
  })
  @ApiParam({
    name: 'id',
    description: '会议室id',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: '删除成功',
  })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.meetingRoomService.delete(id);
  }
}
