import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forRootAsync({
      useFactory(config: ConfigService) {
        return {
          type: 'mysql',
          host: config.get('mysql_server_host'),
          port: config.get('mysql_server_port'),
          username: config.get('mysql_server_username'),
          password: config.get('mysql_server_password'),
          database: config.get('mysql_server_database'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
          poolSize: 10,
          connectorPackage: 'mysql2',
          // extra: {
          //   authPlugin: 'sha256_password',
          // },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.join(__dirname, '.env'),
        path.join(__dirname, '.env.dev'),
      ],
    }),
    UserModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
