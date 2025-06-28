import { ApiProperty } from '@nestjs/swagger';

export class PageListVo<T extends object> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pageNo: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty({
    type: Array<T>,
    description: '列表数据',
  })
  rows: T[];
}
