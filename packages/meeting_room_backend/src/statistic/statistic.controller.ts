import { Controller, Get, Inject, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('statistic')
export class StatisticController {
  @Inject()
  private statisticService: StatisticService;

  @ApiOperation({
    summary: '用户预定统计',
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
  @Get('userBookingCount')
  async userBookingCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.statisticService.userBookingCount(startTime, endTime);
  }

  @ApiOperation({
    summary: '会议室预定统计',
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
  @Get('meetingRoomUsedCount')
  async meetingRoomUsedCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.statisticService.meetingRoomUsedCount(startTime, endTime);
  }
}
