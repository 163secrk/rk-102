import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreederService } from './breeder.service';
import { BreederController } from './breeder.controller';
import { Breeder } from '../entities/breeder.entity';
import { User } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Breeder, User]),
    AuthModule,
  ],
  controllers: [BreederController],
  providers: [BreederService],
  exports: [BreederService],
})
export class BreederModule {}
