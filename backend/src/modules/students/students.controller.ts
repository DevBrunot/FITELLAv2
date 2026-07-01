// file: src/modules/students/students.controller.ts
import {
  Controller, Get, Param, Patch, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentsService } from './students.service';

@UseGuards(AuthGuard('jwt'))
@Controller('api/students')
export class StudentsController {
  constructor(private service: StudentsService) {}

  /** GET /api/students?page=1&limit=20 */
  @Get()
  findAll(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findAll(req.user.sub, +page, +limit);
  }

  /** GET /api/students/:id */
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.sub);
  }

  /** GET /api/students/:id/anamnesis */
  @Get(':id/anamnesis')
  getAnamnesis(@Param('id') id: string, @Request() req) {
    return this.service.getAnamnesis(id, req.user.sub);
  }

  /** GET /api/students/:id/workouts */
  @Get(':id/workouts')
  getWorkouts(
    @Param('id') id: string,
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.getWorkouts(id, req.user.sub, +page, +limit);
  }

  /** PATCH /api/students/:id/approve */
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.service.approve(id, req.user.sub);
  }

  /** PATCH /api/students/:id/reject */
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Request() req) {
    return this.service.reject(id, req.user.sub);
  }
}
