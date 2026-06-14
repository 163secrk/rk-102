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

export enum TransferStatus {
  PENDING = 'pending',
  AWAITING_CONFIRM = 'awaiting_confirm',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  DISPUTED = 'disputed',
}

@Entity('ownership_transfers')
export class OwnershipTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organism, { onDelete: 'CASCADE' })
  @JoinColumn()
  organism: Organism;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  fromUser: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  toUser: User;

  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.PENDING })
  status: TransferStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transferType: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  contract: string;

  @Column({ type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  signFrom: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  signTo: string;

  @Column({ type: 'datetime', nullable: true })
  signedAtFrom: Date;

  @Column({ type: 'datetime', nullable: true })
  signedAtTo: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  witness: User;

  @Column({ type: 'text', nullable: true })
  rejectReason: string;

  @Column({ type: 'datetime', nullable: true })
  rejectedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
