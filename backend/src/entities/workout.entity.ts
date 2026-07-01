// file: src/entities/workout.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { PersonalTrainer } from './personal-trainer.entity';
import { Student } from './student.entity';
import { WorkoutExercise } from './workout-exercise.entity';
import { WorkoutExecution } from './workout-execution.entity';
import { WorkoutFeedback } from './workout-feedback.entity';

export enum WorkoutType {
  GESTATIONAL = 'gestational',
  POST_PARTUM = 'post_partum',
  GENERAL = 'general',
}

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: WorkoutType, default: WorkoutType.GENERAL })
  type: WorkoutType;

  /** Estimated duration in minutes, calculated from exercises */
  @Column({ nullable: true })
  estimatedDurationMinutes: number;

  @Column({ default: false })
  isTemplate: boolean;

  @Column({ nullable: true })
  studentId: string;

  @ManyToOne(() => Student, (s) => s.workouts, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ nullable: true })
  personalTrainerId: string;

  @ManyToOne(() => PersonalTrainer, (pt) => pt.workouts, { nullable: true })
  @JoinColumn({ name: 'personalTrainerId' })
  personalTrainer: PersonalTrainer;

  @Column({ nullable: true })
  sentAt: Date;

  @OneToMany(() => WorkoutExercise, (we) => we.workout, { cascade: true })
  workoutExercises: WorkoutExercise[];

  @OneToMany(() => WorkoutExecution, (e) => e.workout)
  executions: WorkoutExecution[];

  @OneToMany(() => WorkoutFeedback, (f) => f.workout)
  feedbacks: WorkoutFeedback[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
