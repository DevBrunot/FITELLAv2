// file: src/modules/feedback/feedback.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutFeedback } from '../../entities/workout-feedback.entity';
import { Workout } from '../../entities/workout.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutFeedback, Workout])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
