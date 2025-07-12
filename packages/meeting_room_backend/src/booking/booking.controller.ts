import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequireLogin, UserInfo } from '@/common/decorator';

@ApiTags('预定')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiOperation({
    summary: '预定列表',
  })
  @ApiQuery({
    name: 'pageNo',
    description: '页码',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    required: false,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    required: false,
  })
  @ApiQuery({
    name: 'roomName',
    description: '会议室名称',
    required: false,
  })
  @ApiQuery({
    name: 'roomPosition',
    description: '会议室位置',
    required: false,
  })
  @ApiQuery({
    name: 'startTime',
    description: '开始时间',
    required: false,
  })
  @ApiQuery({
    name: 'endTime',
    description: '结束时间',
    required: false,
  })
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), ParseIntPipe) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('username') username: string,
    @Query('roomName') roomName: string,
    @Query('roomPosition') roomPosition: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.bookingService.find(
      pageNo,
      pageSize,
      username,
      roomName,
      roomPosition,
      startTime,
      endTime,
    );
  }

  @ApiOperation({
    summary: '预定会议室',
  })
  @ApiBearerAuth()
  @RequireLogin()
  @Post('add')
  async add(
    @Body() booking: CreateBookingDto,
    @UserInfo('userId') userId: number,
  ) {
    await this.bookingService.add(booking, userId);
    return 'success';
  }

  @ApiOperation({
    summary: '通过预定',
  })
  @RequireLogin()
  @Get('/apply/:id')
  async apply(@Param('id', ParseIntPipe) id: number) {
    await this.bookingService.apply(id);
  }

  @ApiOperation({
    summary: '取消预定',
  })
  @RequireLogin()
  @Get('/reject/:id')
  async reject(@Param('id', ParseIntPipe) id: number) {
    await this.bookingService.reject(id);
  }

  @ApiOperation({
    summary: '解除预定',
  })
  @RequireLogin()
  @Get('/unbind/:id')
  async unbind(@Param('id', ParseIntPipe) id: number) {
    await this.bookingService.unbind(id);
  }

  @ApiOperation({
    summary: '催办',
  })
  @RequireLogin()
  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }
}
