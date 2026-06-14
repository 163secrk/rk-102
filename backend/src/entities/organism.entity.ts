import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Breeder } from './breeder.entity';
import { Pedigree } from './pedigree.entity';
import { HealthLog } from './health-log.entity';
import { OwnershipTransfer } from './ownership-transfer.entity';
import { TraceCode } from './trace-code.entity';

export enum OrganismCategory {
  PLANT = 'plant',
  PET = 'pet',
  HYBRID = 'hybrid',
}

export enum OrganismGender {
  MALE = 'male',
  FEMALE = 'female',
  HERMAPHRODITE = 'hermaphrodite',
  UNKNOWN = 'unknown',
}

export enum OrganismStatus {
  ALIVE = 'alive',
  DEAD = 'dead',
  MISSING = 'missing',
  SOLD = 'sold',
  DONATED = 'donated',
}

@Entity('organisms')
export class Organism {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: OrganismCategory })
  category: OrganismCategory;

  @Column({ length: 100 })
  species: string;

  @Column({ length: 100, nullable: true })
  subspecies: string;

  @Column({ length: 100, nullable: true })
  variety: string;

  @Column({ type: 'enum', enum: OrganismGender, default: OrganismGender.UNKNOWN })
  gender: OrganismGender;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  birthWeight: number;

  @Column({ length: 100, nullable: true })
  birthPlace: string;

  @Column({ type: 'text', nullable: true })
  appearance: string;

  @Column({ type: 'text', nullable: true })
  traits: string;

  @Column({ type: 'text', nullable: true })
  genetics: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ length: 500, nullable: true })
  coverImage: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedValue: number;

  @Column({ type: 'enum', enum: OrganismStatus, default: OrganismStatus.ALIVE })
  status: OrganismStatus;

  @Column({ type: 'text', nullable: true })
  chipNumber: string;

  @Column({ length: 100, nullable: true })
  dnaSample: string;

  @ManyToOne(() => Breeder, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  breeder: Breeder;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  owner: User;

  @OneToMany(() => Pedigree, (p) => p.organism)
  pedigreeRelations: Pedigree[];

  @OneToMany(() => HealthLog, (h) => h.organism)
  healthLogs: HealthLog[];

  @OneToMany(() => OwnershipTransfer, (o) => o.organism)
  ownershipHistory: OwnershipTransfer[];

  @OneToMany(() => TraceCode, (t) => t.organism)
  traceCodes: TraceCode[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
