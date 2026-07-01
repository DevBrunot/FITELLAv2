// file: src/entities/anamnesis.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';

@Entity('anamneses')
export class Anamnesis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  studentId: string;

  @OneToOne(() => Student, (s) => s.anamnesis)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: true })
  gestationalWeeks: number;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  isPostPartum: boolean;

  @Column({ nullable: true })
  weeksPostPartum: number;

  @Column({ nullable: true })
  hasPreviousExerciseHistory: boolean;

  @Column({ nullable: true, type: 'text' })
  medicalRestrictions: string;

  @Column({ nullable: true, type: 'text' })
  healthObservations: string;

  @Column({ nullable: true })
  doctorName: string;

  @Column({ nullable: true })
  doctorPhone: string;

  /** LGPD consent — required and must be true */
  @Column({ default: false })
  lgpdConsent: boolean;

  @Column({ nullable: true })
  lgpdConsentAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
