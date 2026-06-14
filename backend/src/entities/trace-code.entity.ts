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

@Entity('trace_codes')
export class TraceCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organism, { onDelete: 'CASCADE' })
  @JoinColumn()
  organism: Organism;

  @Column({ length: 100, unique: true })
  code: string;

  @Column({ type: 'text' })
  qrData: string;

  @Column({ type: 'text' })
  qrImage: string;

  @Column({ type: 'simple-json', nullable: true })
  payload: Record<string, any>;

  @Column({ default: 0 })
  scanCount: number;

  @Column({ type: 'datetime', nullable: true })
  lastScanAt: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastScanIp: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  createdBy: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
