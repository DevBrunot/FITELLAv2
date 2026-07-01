// file: src/entities/workout-feedback.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Workout } from './workout.entity';

@Entity('workout_feedbacks')
export class WorkoutFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  workoutId: string;

  @ManyToOne(() => Workout, (w) => w.feedbacks)
  @JoinColumn({ name: 'workoutId' })
  workout: Workout;

  /** Rating 1-5 */
  @Column({ type: 'int' })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  /** Perceived effort: easy | moderate | hard */
  @Column({ nullable: true })
  effort: string;

  @Column({ nullable: true, type: 'text' })
  painOrDiscomfort: string;

  @CreateDateColumn()
  createdAt: Date;
}
