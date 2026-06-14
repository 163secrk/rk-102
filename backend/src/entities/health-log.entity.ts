import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organism } from './organism.entity';
import { User } from './user.entity';

export enum HealthLogType {
  CHECKUP = 'checkup',
  VACCINATION = 'vaccination',
  TREATMENT = 'treatment',
  FEEDING = 'feeding',
  GROOMING = 'grooming',
  WATERING = 'watering',
  FERTILIZING = 'fertilizing',
  REPRODUCTION = 'reproduction',
  TRANSPLANT = 'transplant',
  ACCIDENT = 'accident',
  OTHER = 'other',
}

export enum HealthStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical',
}

@Entity('health_logs')
export class HealthLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organism, { onDelete: 'CASCADE' })
  @JoinColumn()
  organism: Organism;

  @Column({ type: 'enum', enum: HealthLogType })
  type: HealthLogType;

  @Column({ type: 'enum', enum: HealthStatus, default: HealthStatus.GOOD })
  healthStatus: HealthStatus;

  @Column({ type: 'datetime' })
  logDate: Date;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  temperature: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'simple-array', nullable: true })
  symptoms: string[];

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  prescription: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  createdBy: User;

  @Column({ length: 100, nullable: true })
  veterinarian: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
