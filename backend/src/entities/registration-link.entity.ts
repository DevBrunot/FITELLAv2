// file: src/entities/registration-link.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { PersonalTrainer } from './personal-trainer.entity';

export enum LinkType {
  PERMANENT = 'permanent',
  EXPIRABLE = 'expirable',
}

@Entity('registration_links')
export class RegistrationLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 8 })
  code: string;

  @Column({ type: 'enum', enum: LinkType, default: LinkType.PERMANENT })
  linkType: LinkType;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  personalTrainerId: string;

  @ManyToOne(() => PersonalTrainer, (pt) => pt.registrationLinks)
  @JoinColumn({ name: 'personalTrainerId' })
  personalTrainer: PersonalTrainer;

  @CreateDateColumn()
  createdAt: Date;
}
