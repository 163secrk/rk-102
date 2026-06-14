import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Breeder, BreederType, BreederStatus } from '../entities/breeder.entity';
import { RegisterDto, BreederRegisterDto, LoginDto, RegisterAccountType } from './dto/auth.dto';

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
    @InjectRepository(Breeder)
    private breederRepository: Repository<Breeder>,
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.accountType === RegisterAccountType.BREEDER) {
      throw new BadRequestException('请使用育种者注册接口');
    }
    return this.registerGuest(dto);
  }

  private async registerGuest(dto: RegisterDto) {
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

  async registerBreeder(dto: BreederRegisterDto) {
    this.validateBreederDto(dto);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [usernameExists, emailExists, phoneExists, idCardExists, businessLicenseExists] = await Promise.all([
        this.userRepository.findOne({ where: { username: dto.username } }),
        this.userRepository.findOne({ where: { email: dto.email } }),
        dto.phone ? this.userRepository.findOne({ where: { phone: dto.phone } }) : Promise.resolve(null),
        dto.idCardNumber ? this.breederRepository.findOne({ where: { idCardNumber: dto.idCardNumber } }) : Promise.resolve(null),
        dto.businessLicense ? this.breederRepository.findOne({ where: { businessLicense: dto.businessLicense } }) : Promise.resolve(null),
      ]);

      if (usernameExists) throw new ConflictException('用户名已存在');
      if (emailExists) throw new ConflictException('邮箱已被注册');
      if (phoneExists) throw new ConflictException('手机号已被注册');
      if (idCardExists) throw new ConflictException('身份证号已被注册');
      if (businessLicenseExists) throw new ConflictException('营业执照编号已被注册');

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = this.userRepository.create({
        username: dto.username,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        nickname: dto.nickname || dto.username,
        role: UserRole.BREEDER,
        status: UserStatus.PENDING,
      });

      const savedUser = await queryRunner.manager.save(user);

      const breeder = this.breederRepository.create({
        user: savedUser,
        type: dto.breederType,
        realName: dto.realName,
        idCardNumber: dto.idCardNumber,
        companyName: dto.companyName,
        businessLicense: dto.businessLicense,
        address: dto.address,
        contactPhone: dto.contactPhone,
        description: dto.description,
        credentials: dto.credentials,
        status: BreederStatus.PENDING,
      });

      await queryRunner.manager.save(breeder);
      await queryRunner.commitTransaction();

      const fullUser = await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['breeder'],
      });

      const token = this.generateToken(fullUser);

      return {
        access_token: token,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '7d',
        user: this.sanitizeUser(fullUser),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validateBreederDto(dto: BreederRegisterDto) {
    if (dto.breederType === BreederType.INDIVIDUAL) {
      if (!dto.idCardNumber) {
        throw new BadRequestException('个人育种者必须提供身份证号');
      }
    } else {
      if (!dto.companyName) {
        throw new BadRequestException('企业/机构/基地必须提供企业名称');
      }
      if (!dto.businessLicense) {
        throw new BadRequestException('企业/机构/基地必须提供营业执照编号');
      }
    }

    if (!dto.credentials) {
      throw new BadRequestException('请上传资质证明文件');
    }
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
