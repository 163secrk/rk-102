import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { BreederModule } from './breeder/breeder.module';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    AuthModule,
    UploadModule,
    BreederModule,
  ],
})
export class AppModule {}
