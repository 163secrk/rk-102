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

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
  CRITICAL = 'critical',
}

export enum AlertType {
  VACCINATION = 'vaccination',
  FEEDING = 'feeding',
  WATERING = 'watering',
  GROOMING = 'grooming',
  HEALTH_CHECK = 'health_check',
  REPRODUCTION = 'reproduction',
  BIRTHDAY = 'birthday',
  OWNERSHIP = 'ownership',
  CERTIFICATION = 'certification',
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

export enum ScheduleRepeat {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum AlertStatus {
  PENDING = 'pending',
  NOTIFIED = 'notified',
  ACKNOWLEDGED = 'acknowledged',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Organism, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  organism: Organism;

  @Column({ type: 'enum', enum: AlertType, default: AlertType.CUSTOM })
  type: AlertType;

  @Column({ type: 'enum', enum: AlertLevel, default: AlertLevel.INFO })
  level: AlertLevel;

  @Column({ type: 'enum', enum: AlertStatus, default: AlertStatus.PENDING })
  status: AlertStatus;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'datetime' })
  scheduledAt: Date;

  @Column({ type: 'int', default: 0 })
  remindBeforeMinutes: number;

  @Column({ type: 'enum', enum: ScheduleRepeat, default: ScheduleRepeat.NONE })
  repeat: ScheduleRepeat;

  @Column({ type: 'int', nullable: true })
  customRepeatDays: number;

  @Column({ type: 'datetime', nullable: true })
  repeatEndDate: Date;

  @Column({ default: 0 })
  notifyCount: number;

  @Column({ type: 'datetime', nullable: true })
  lastNotifiedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  acknowledgedBy: User;

  @Column({ default: false })
  pushNotification: boolean;

  @Column({ default: false })
  emailNotification: boolean;

  @Column({ default: false })
  smsNotification: boolean;

  @Column({ type: 'text', nullable: true })
  meta: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
