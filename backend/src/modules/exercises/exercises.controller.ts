// file: src/modules/exercises/exercises.controller.ts
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param,
  Patch, Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/exercises')
export class ExercisesController {
  constructor(private service: ExercisesService) {}

  /** GET /api/exercises?page=1&limit=20 */
  @Get()
  findAll(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findAll(req.user.sub, +page, +limit);
  }

  /** GET /api/exercises/:id */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.sub);
  }

  /** POST /api/exercises */
  @Post()
  create(@Body() dto: CreateExerciseDto, @Request() req) {
    return this.service.create(dto, req.user.sub);
  }

  /** PATCH /api/exercises/:id */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExerciseDto, @Request() req) {
    return this.service.update(id, dto, req.user.sub);
  }

  /** DELETE /api/exercises/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.sub);
  }
}
