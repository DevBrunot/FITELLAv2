// file: src/entities/notification.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { PersonalTrainer } from './personal-trainer.entity';
import { Student } from './student.entity';

export enum NotificationTarget {
  TRAINER = 'trainer',
  STUDENT = 'student',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationTarget })
  target: NotificationTarget;

  @Column({ nullable: true })
  personalTrainerId: string;

  @ManyToOne(() => PersonalTrainer, (pt) => pt.notifications, { nullable: true })
  @JoinColumn({ name: 'personalTrainerId' })
  personalTrainer: PersonalTrainer;

  @Column({ nullable: true })
  studentId: string;

  @ManyToOne(() => Student, (s) => s.notifications, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ nullable: true })
  type: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
