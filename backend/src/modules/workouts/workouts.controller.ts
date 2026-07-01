// file: src/modules/workouts/workouts.controller.ts
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto, UpdateWorkoutDto, SendWorkoutDto } from './dto/workout.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/workouts')
export class WorkoutsController {
  constructor(private service: WorkoutsService) {}

  /** GET /api/workouts?page=1&limit=20 */
  @Get()
  findAll(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findAll(req.user.sub, +page, +limit);
  }

  /** GET /api/workouts/:id */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.sub);
  }

  /** POST /api/workouts */
  @Post()
  create(@Body() dto: CreateWorkoutDto, @Request() req) {
    return this.service.create(dto, req.user.sub);
  }

  /** PATCH /api/workouts/:id */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkoutDto, @Request() req) {
    return this.service.update(id, dto, req.user.sub);
  }

  /** DELETE /api/workouts/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.sub);
  }

  /** POST /api/workouts/:id/save-template */
  @Post(':id/save-template')
  saveTemplate(@Param('id') id: string, @Request() req) {
    return this.service.saveAsTemplate(id, req.user.sub);
  }

  /** POST /api/workouts/:id/send */
  @Post(':id/send')
  send(@Param('id') id: string, @Body() dto: SendWorkoutDto, @Request() req) {
    return this.service.sendToStudent(id, dto, req.user.sub);
  }
}
