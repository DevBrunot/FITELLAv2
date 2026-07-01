// file: src/modules/student-workouts/student-workouts.controller.ts
import {
  Body, Controller, Get, Param, Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentWorkoutsService } from './student-workouts.service';

@UseGuards(AuthGuard('jwt'))
@Controller('api/student/workouts')
export class StudentWorkoutsController {
  constructor(private service: StudentWorkoutsService) {}

  /** GET /api/student/workouts/completed */
  @Get('completed')
  completed(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findCompleted(req.user.sub, +page, +limit);
  }

  /** GET /api/student/workouts */
  @Get()
  findAll(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findAll(req.user.sub, +page, +limit);
  }

  /** GET /api/student/workouts/:id */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.sub);
  }

  /** POST /api/student/workouts/:id/start */
  @Post(':id/start')
  start(@Param('id') id: string, @Request() req) {
    return this.service.startWorkout(id, req.user.sub);
  }

  /** POST /api/student/workouts/:id/finish */
  @Post(':id/finish')
  finish(
    @Param('id') id: string,
    @Request() req,
    @Body('executionId') executionId?: string,
  ) {
    return this.service.finishWorkout(id, req.user.sub, executionId);
  }
}
