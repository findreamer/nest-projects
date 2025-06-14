import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from '@/common/constant';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: REDIS_CLIENT,
      async useFactory(configService: ConfigService) {
        const host = configService.get('redis_server_host');
        const port = configService.get('redis_server_port');
        const db = configService.get('redis_server_db');
        console.log(host, port, db);
        const client = createClient({
          socket: {
            host,
            port,
          },
          database: db,
        });

        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
