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

export enum PedigreeRelation {
  FATHER = 'father',
  MOTHER = 'mother',
  CHILD = 'child',
  SIBLING = 'sibling',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  CLONE = 'clone',
  GRAFT = 'graft',
}

@Entity('pedigrees')
export class Pedigree {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organism, { onDelete: 'CASCADE' })
  @JoinColumn()
  organism: Organism;

  @ManyToOne(() => Organism, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  relatedOrganism: Organism;

  @Column({ type: 'enum', enum: PedigreeRelation })
  relation: PedigreeRelation;

  @Column({ type: 'int', default: 1 })
  generation: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ default: true })
  confirmed: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dnaVerification: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
