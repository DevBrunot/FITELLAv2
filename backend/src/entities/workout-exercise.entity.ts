// file: src/entities/workout-exercise.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Workout } from './workout.entity';
import { Exercise } from './exercise.entity';

@Entity('workout_exercises')
export class WorkoutExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workoutId: string;

  @ManyToOne(() => Workout, (w) => w.workoutExercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workoutId' })
  workout: Workout;

  @Column()
  exerciseId: string;

  @ManyToOne(() => Exercise, (e) => e.workoutExercises)
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @Column({ default: 1 })
  sets: number;

  /** If useTime=true: timeOn (seconds) is used instead of reps */
  @Column({ default: false })
  useTime: boolean;

  @Column({ nullable: true })
  reps: number;

  /** Duration of each set in seconds (used when useTime=true) */
  @Column({ nullable: true })
  timeOn: number;

  /** Rest between sets in seconds */
  @Column({ nullable: true })
  restSeconds: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ default: 0 })
  order: number;
}
