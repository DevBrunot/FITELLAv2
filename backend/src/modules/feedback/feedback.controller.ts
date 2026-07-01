// file: src/modules/feedback/feedback.controller.ts
import {
  Body, Controller, Get, Param, Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeedbackService } from './feedback.service';
import { CreateWorkoutFeedbackDto } from './dto/feedback.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/workouts')
export class FeedbackController {
  constructor(private service: FeedbackService) {}

  /** POST /api/workouts/:workoutId/feedback — student submits feedback */
  @Post(':workoutId/feedback')
  create(
    @Param('workoutId') workoutId: string,
    @Body() dto: CreateWorkoutFeedbackDto,
    @Request() req,
  ) {
    return this.service.create(workoutId, dto, req.user.sub);
  }

  /** GET /api/workouts/:workoutId/feedback — trainer views feedback */
  @Get(':workoutId/feedback')
  findAll(
    @Param('workoutId') workoutId: string,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findByWorkout(workoutId, req.user.sub, +page, +limit);
  }
}
