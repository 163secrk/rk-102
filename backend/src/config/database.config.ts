import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import * as path from 'path';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'Asd123.com',
      database: process.env.DB_DATABASE || 'spiritlink',
      entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
      synchronize: true,
      charset: 'utf8mb4',
      timezone: '+08:00',
      logging: process.env.NODE_ENV !== 'production',
    };
  }
}
