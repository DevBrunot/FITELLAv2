// file: src/modules/workouts/workouts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from '../../entities/workout.entity';
import { WorkoutExercise } from '../../entities/workout-exercise.entity';
import { Exercise } from '../../entities/exercise.entity';
import { Student } from '../../entities/student.entity';
import { Notification } from '../../entities/notification.entity';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workout, WorkoutExercise, Exercise, Student, Notification])],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
