import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { GetUser } from './decorators/auth.decorator';
import { User } from '../entities/user.entity';

@ApiTags('认证 Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录（支持用户名/邮箱/手机号）' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async profile(@GetUser() user: User) {
    return this.authService.getProfile(user);
  }

  @Post('logout')
  @ApiOperation({ summary: '用户登出（前端清除Token）' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: '登出成功', timestamp: new Date().toISOString() };
  }

  @Get('check')
  @ApiOperation({ summary: '检查Token有效性' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async check(@GetUser() user: User) {
    return {
      valid: true,
      userId: user.id,
      role: user.role,
      username: user.username,
    };
  }
}
