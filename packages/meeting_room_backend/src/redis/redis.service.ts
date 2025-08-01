import { REDIS_CLIENT } from '@/common/constant';
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject(REDIS_CLIENT)
  private redisClient: RedisClientType;

  async get(key: string) {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    const res = await this.redisClient.set(key, value);

    if (ttl) {
      this.redisClient.expire(key, ttl);
    }
    return res;
  }
}
