// file: src/entities/personal-trainer.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Student } from './student.entity';
import { Exercise } from './exercise.entity';
import { Workout } from './workout.entity';
import { RegistrationLink } from './registration-link.entity';
import { Notification } from './notification.entity';

@Entity('personal_trainers')
export class PersonalTrainer {
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

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Student, (s) => s.personalTrainer)
  students: Student[];

  @OneToMany(() => Exercise, (e) => e.personalTrainer)
  exercises: Exercise[];

  @OneToMany(() => Workout, (w) => w.personalTrainer)
  workouts: Workout[];

  @OneToMany(() => RegistrationLink, (r) => r.personalTrainer)
  registrationLinks: RegistrationLink[];

  @OneToMany(() => Notification, (n) => n.personalTrainer)
  notifications: Notification[];
}
