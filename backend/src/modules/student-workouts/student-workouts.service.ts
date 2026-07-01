// file: src/modules/student-workouts/student-workouts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workout } from '../../entities/workout.entity';
import { WorkoutExecution, ExecutionStatus } from '../../entities/workout-execution.entity';

@Injectable()
export class StudentWorkoutsService {
  constructor(
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    @InjectRepository(WorkoutExecution) private execRepo: Repository<WorkoutExecution>,
  ) {}

  /** List workouts assigned to this student */
  async findAll(studentId: string, page = 1, limit = 20) {
    const [data, total] = await this.workoutRepo.findAndCount({
      where: { studentId },
      relations: ['workoutExercises', 'workoutExercises.exercise'],
      skip: (page - 1) * limit,
      take: limit,
      order: { sentAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string, studentId: string) {
    const workout = await this.workoutRepo.findOne({
      where: { id, studentId },
      relations: ['workoutExercises', 'workoutExercises.exercise'],
    });
    if (!workout) throw new NotFoundException('Treino não encontrado');
    return workout;
  }

  /** POST /api/student/workouts/:id/start */
  async startWorkout(id: string, studentId: string) {
    await this.findOne(id, studentId);
    const exec = this.execRepo.create({
      workoutId: id,
      studentId,
      status: ExecutionStatus.STARTED,
      startedAt: new Date(),
    });
    return this.execRepo.save(exec);
  }

  /** POST /api/student/workouts/:id/finish */
  async finishWorkout(id: string, studentId: string, executionId?: string) {
    const exec = executionId
      ? await this.execRepo.findOneBy({ id: executionId, workoutId: id, studentId })
      : await this.execRepo.findOne({
          where: { workoutId: id, studentId, status: ExecutionStatus.STARTED },
          order: { createdAt: 'DESC' },
        });

    if (!exec) {
      throw new NotFoundException(
        executionId ? 'Execução não encontrada' : 'Nenhuma execução em andamento',
      );
    }

    exec.status = ExecutionStatus.COMPLETED;
    exec.finishedAt = new Date();
    exec.durationSeconds = Math.floor(
      (exec.finishedAt.getTime() - exec.startedAt.getTime()) / 1000,
    );
    return this.execRepo.save(exec);
  }

  /** GET /api/student/workouts/completed */
  async findCompleted(studentId: string, page = 1, limit = 20) {
    const [data, total] = await this.execRepo.findAndCount({
      where: { studentId, status: ExecutionStatus.COMPLETED },
      relations: ['workout'],
      skip: (page - 1) * limit,
      take: limit,
      order: { finishedAt: 'DESC' },
    });
    return { data, total, page, limit };
  }
}
