import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Breeder, BreederStatus, BreederType } from '../entities/breeder.entity';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { ReviewBreederDto } from '../auth/dto/auth.dto';

@Injectable()
export class BreederService {
  constructor(
    @InjectRepository(Breeder)
    private breederRepository: Repository<Breeder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(status?: BreederStatus, type?: BreederType, page = 1, limit = 10) {
    const query = this.breederRepository
      .createQueryBuilder('breeder')
      .leftJoinAndSelect('breeder.user', 'user')
      .where('1=1');

    if (status) {
      query.andWhere('breeder.status = :status', { status });
    }
    if (type) {
      query.andWhere('breeder.type = :type', { type });
    }

    const [data, total] = await query
      .orderBy('breeder.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const breeder = await this.breederRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!breeder) {
      throw new NotFoundException('育种者信息不存在');
    }
    return breeder;
  }

  async approve(id: string, dto: ReviewBreederDto, reviewer: User) {
    const breeder = await this.findOne(id);

    if (breeder.status !== BreederStatus.PENDING && breeder.status !== BreederStatus.UNDER_REVIEW) {
      throw new BadRequestException('当前状态不允许审核通过');
    }

    breeder.status = BreederStatus.APPROVED;
    breeder.reviewNote = dto.reviewNote;
    breeder.reviewedAt = new Date();
    breeder.certifiedAt = new Date();
    breeder.certificationNumber = `CERT${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await this.breederRepository.save(breeder);

    const user = await this.userRepository.findOne({ where: { id: breeder.user.id } });
    if (user) {
      user.status = UserStatus.ACTIVE;
      user.role = UserRole.BREEDER;
      await this.userRepository.save(user);
    }

    return breeder;
  }

  async reject(id: string, dto: ReviewBreederDto, reviewer: User) {
    const breeder = await this.findOne(id);

    if (breeder.status !== BreederStatus.PENDING && breeder.status !== BreederStatus.UNDER_REVIEW) {
      throw new BadRequestException('当前状态不允许审核拒绝');
    }

    if (!dto.reviewNote) {
      throw new BadRequestException('拒绝时必须填写审核备注');
    }

    breeder.status = BreederStatus.REJECTED;
    breeder.reviewNote = dto.reviewNote;
    breeder.reviewedAt = new Date();

    await this.breederRepository.save(breeder);

    const user = await this.userRepository.findOne({ where: { id: breeder.user.id } });
    if (user) {
      user.status = UserStatus.DISABLED;
      await this.userRepository.save(user);
    }

    return breeder;
  }

  async suspend(id: string, dto: ReviewBreederDto, reviewer: User) {
    const breeder = await this.findOne(id);

    if (breeder.status !== BreederStatus.APPROVED) {
      throw new BadRequestException('只有已认证的育种者才能被暂停');
    }

    breeder.status = BreederStatus.SUSPENDED;
    breeder.reviewNote = dto.reviewNote;
    breeder.reviewedAt = new Date();

    await this.breederRepository.save(breeder);

    const user = await this.userRepository.findOne({ where: { id: breeder.user.id } });
    if (user) {
      user.status = UserStatus.DISABLED;
      await this.userRepository.save(user);
    }

    return breeder;
  }

  async getStatistics() {
    const [total, pending, approved, rejected, individual, company] = await Promise.all([
      this.breederRepository.count(),
      this.breederRepository.count({ where: { status: BreederStatus.PENDING } }),
      this.breederRepository.count({ where: { status: BreederStatus.APPROVED } }),
      this.breederRepository.count({ where: { status: BreederStatus.REJECTED } }),
      this.breederRepository.count({ where: { type: BreederType.INDIVIDUAL } }),
      this.breederRepository.count({ where: { type: BreederType.COMPANY } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      individual,
      company,
    };
  }
}
