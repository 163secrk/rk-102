import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum BreederType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  ORGANIZATION = 'organization',
  RESEARCH_INSTITUTE = 'research_institute',
}

export enum BreederStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Entity('breeders')
export class Breeder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.breeder, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'enum', enum: BreederType })
  type: BreederType;

  @Column({ length: 100 })
  realName: string;

  @Column({ length: 30, unique: true, nullable: true })
  idCardNumber: string;

  @Column({ length: 100, nullable: true })
  companyName: string;

  @Column({ length: 50, unique: true, nullable: true })
  businessLicense: string;

  @Column({ length: 200, nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  contactPhone: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  credentials: string;

  @Column({ type: 'enum', enum: BreederStatus, default: BreederStatus.PENDING })
  status: BreederStatus;

  @Column({ length: 100, nullable: true })
  certificationNumber: string;

  @Column({ type: 'datetime', nullable: true })
  certifiedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  reviewedAt: Date;

  @Column({ length: 255, nullable: true })
  reviewNote: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
