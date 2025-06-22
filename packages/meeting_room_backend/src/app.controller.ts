import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { REQUIRE_PERMISSIONS_METADATA } from './common/constant';

@Controller()
@SetMetadata(REQUIRE_PERMISSIONS_METADATA, ['aaaa'])
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('aaa')
  aaaa() {
    return 'aaa';
  }

  @SetMetadata('require-login', true)
  @SetMetadata(REQUIRE_PERMISSIONS_METADATA, ['ccc'])
  @Get('bbb')
  bbb() {
    return 'bbb';
  }
}
