// file: src/modules/student-workouts/student-workouts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from '../../entities/workout.entity';
import { WorkoutExecution } from '../../entities/workout-execution.entity';
import { StudentWorkoutsController } from './student-workouts.controller';
import { StudentWorkoutsService } from './student-workouts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workout, WorkoutExecution])],
  controllers: [StudentWorkoutsController],
  providers: [StudentWorkoutsService],
})
export class StudentWorkoutsModule {}
