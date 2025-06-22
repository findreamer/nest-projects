import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as path from 'path';
import { APP_GUARD } from '@nestjs/core';
import { LoginGuard } from './common/guard/login.guard';
import { PermissionGuard } from './common/guard/permission.guard';

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
    JwtModule.registerAsync({
      global: true,
      useFactory(config: ConfigService) {
        return {
          secret: config.get('jwt_secret'),
          signOptions: {
            expiresIn: config.get('jwt_access_token_expires'), // 30分钟过期
          },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
