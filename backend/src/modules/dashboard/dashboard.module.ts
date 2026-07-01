// file: src/modules/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { Workout } from '../../entities/workout.entity';
import { WorkoutExecution } from '../../entities/workout-execution.entity';
import { WorkoutFeedback } from '../../entities/workout-feedback.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Workout, WorkoutExecution, WorkoutFeedback])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
