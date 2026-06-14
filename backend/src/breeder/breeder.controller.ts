import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BreederService } from './breeder.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/auth.decorator';
import { User, UserRole } from '../entities/user.entity';
import { BreederStatus, BreederType } from '../entities/breeder.entity';
import { ReviewBreederDto } from '../auth/dto/auth.dto';

@ApiTags('育种者管理 Breeder')
@Controller('breeders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BreederController {
  constructor(private readonly breederService: BreederService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VERIFIER)
  @ApiOperation({ summary: '获取育种者列表（管理员/审核员）' })
  @ApiQuery({ name: 'status', enum: BreederStatus, required: false })
  @ApiQuery({ name: 'type', enum: BreederType, required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('status') status?: BreederStatus,
    @Query('type') type?: BreederType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.breederService.findAll(status, type, page, limit);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VERIFIER)
  @ApiOperation({ summary: '获取育种者统计数据' })
  async getStatistics() {
    return this.breederService.getStatistics();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VERIFIER)
  @ApiOperation({ summary: '获取育种者详情' })
  async findOne(@Param('id') id: string) {
    return this.breederService.findOne(id);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VERIFIER)
  @ApiOperation({ summary: '审核通过育种者认证' })
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Body() dto: ReviewBreederDto,
    @GetUser() reviewer: User,
  ) {
    return this.breederService.approve(id, dto, reviewer);
  }

  @Put(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.VERIFIER)
  @ApiOperation({ summary: '审核拒绝育种者认证' })
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Body() dto: ReviewBreederDto,
    @GetUser() reviewer: User,
  ) {
    return this.breederService.reject(id, dto, reviewer);
  }

  @Put(':id/suspend')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '暂停已认证的育种者' })
  @HttpCode(HttpStatus.OK)
  async suspend(
    @Param('id') id: string,
    @Body() dto: ReviewBreederDto,
    @GetUser() reviewer: User,
  ) {
    return this.breederService.suspend(id, dto, reviewer);
  }
}
