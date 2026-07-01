// file: src/entities/student.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne,
} from 'typeorm';
import { PersonalTrainer } from './personal-trainer.entity';
import { Anamnesis } from './anamnesis.entity';
import { Workout } from './workout.entity';
import { WorkoutExecution } from './workout-execution.entity';
import { Notification } from './notification.entity';

export enum StudentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.PENDING })
  status: StudentStatus;

  @Column({ nullable: true })
  registrationCode: string;

  @Column({ nullable: true })
  personalTrainerId: string;

  @ManyToOne(() => PersonalTrainer, (pt) => pt.students, { nullable: true })
  @JoinColumn({ name: 'personalTrainerId' })
  personalTrainer: PersonalTrainer;

  @OneToOne(() => Anamnesis, (a) => a.student, { nullable: true })
  anamnesis: Anamnesis;

  @OneToMany(() => Workout, (w) => w.student)
  workouts: Workout[];

  @OneToMany(() => WorkoutExecution, (e) => e.student)
  executions: WorkoutExecution[];

  @OneToMany(() => Notification, (n) => n.student)
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
