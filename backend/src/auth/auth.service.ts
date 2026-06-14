import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const [usernameExists, emailExists, phoneExists] = await Promise.all([
      this.userRepository.findOne({ where: { username: dto.username } }),
      this.userRepository.findOne({ where: { email: dto.email } }),
      dto.phone ? this.userRepository.findOne({ where: { phone: dto.phone } }) : Promise.resolve(null),
    ]);

    if (usernameExists) throw new ConflictException('用户名已存在');
    if (emailExists) throw new ConflictException('邮箱已被注册');
    if (phoneExists) throw new ConflictException('手机号已被注册');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      nickname: dto.nickname || dto.username,
      role: UserRole.GUEST,
      status: UserStatus.ACTIVE,
    });

    const saved = await this.userRepository.save(user);
    const token = this.generateToken(saved);

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '7d',
      user: this.sanitizeUser(saved),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where('u.username = :account OR u.email = :account OR u.phone = :account', {
        account: dto.account,
      })
      .getOne();

    if (!user) throw new UnauthorizedException('账号或密码错误');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('账号或密码错误');

    if (user.status === UserStatus.DISABLED) throw new UnauthorizedException('账号已被禁用');
    if (user.status === UserStatus.BANNED) throw new UnauthorizedException('账号已被封禁');

    user.lastLoginIp = '';
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const token = this.generateToken(user);

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '7d',
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('用户不存在或Token无效');
    if (user.status === UserStatus.DISABLED || user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('账号状态异常');
    }
    return user;
  }

  async getProfile(user: User) {
    const full = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['breeder'],
    });
    return this.sanitizeUser(full);
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, ...rest } = user;
    return rest;
  }
}
