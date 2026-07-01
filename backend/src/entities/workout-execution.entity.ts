// file: src/entities/workout-execution.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Workout } from './workout.entity';

export enum ExecutionStatus {
  STARTED = 'started',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('workout_executions')
export class WorkoutExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => Student, (s) => s.executions)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  workoutId: string;

  @ManyToOne(() => Workout, (w) => w.executions)
  @JoinColumn({ name: 'workoutId' })
  workout: Workout;

  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.STARTED })
  status: ExecutionStatus;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  finishedAt: Date;

  /** Duration in seconds */
  @Column({ nullable: true })
  durationSeconds: number;

  @CreateDateColumn()
  createdAt: Date;
}
