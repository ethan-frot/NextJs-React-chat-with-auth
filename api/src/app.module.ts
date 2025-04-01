import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { Gateway } from './gateway';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'chatapp',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // À désactiver en production
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
  ],
  providers: [Gateway],
})
export class AppModule {}
