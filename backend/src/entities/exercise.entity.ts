// file: src/entities/exercise.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { PersonalTrainer } from './personal-trainer.entity';
import { WorkoutExercise } from './workout-exercise.entity';

export enum ExerciseCategory {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  MOBILITY = 'mobility',
  RELAXATION = 'relaxation',
  BREATHING = 'breathing',
}

export enum VideoType {
  YOUTUBE = 'youtube',
  UPLOAD = 'upload',
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  youtubeUrl: string;

  @Column({ type: 'enum', enum: VideoType, nullable: true })
  videoType: VideoType;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  videoId: string;

  @Column({ nullable: true })
  thumbnail: string;

  /** Duration in seconds (extracted from YouTube or set manually) */
  @Column({ nullable: true })
  durationSeconds: number;

  @Column({ type: 'enum', enum: ExerciseCategory, nullable: true })
  category: ExerciseCategory;

  /** If true, cannot be used in gestational (pregnancy) workouts */
  @Column({ default: false })
  postPartumOnly: boolean;

  @Column({ nullable: true })
  personalTrainerId: string;

  @ManyToOne(() => PersonalTrainer, (pt) => pt.exercises, { nullable: true })
  @JoinColumn({ name: 'personalTrainerId' })
  personalTrainer: PersonalTrainer;

  @OneToMany(() => WorkoutExercise, (we) => we.exercise)
  workoutExercises: WorkoutExercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
