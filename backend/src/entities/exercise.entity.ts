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
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  youtubeUrl: string | null;

  @Column({ type: 'enum', enum: VideoType, nullable: true })
  videoType: VideoType | null;

  @Column({ type: 'varchar', nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  videoId: string | null;

  @Column({ type: 'varchar', nullable: true })
  thumbnail: string | null;

  /** Duration in seconds (extracted from YouTube or set manually) */
  @Column({ type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({ type: 'enum', enum: ExerciseCategory, nullable: true })
  category: ExerciseCategory | null;

  /** If true, cannot be used in gestational (pregnancy) workouts */
  @Column({ default: false })
  postPartumOnly: boolean;

  @Column({ type: 'uuid', nullable: true })
  personalTrainerId: string | null;

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
