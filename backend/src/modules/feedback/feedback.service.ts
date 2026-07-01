// file: src/modules/feedback/feedback.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutFeedback } from '../../entities/workout-feedback.entity';
import { Workout } from '../../entities/workout.entity';
import { CreateWorkoutFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(WorkoutFeedback) private repo: Repository<WorkoutFeedback>,
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
  ) {}

  async create(workoutId: string, dto: CreateWorkoutFeedbackDto, studentId: string) {
    const workout = await this.workoutRepo.findOneBy({ id: workoutId, studentId });
    if (!workout) throw new NotFoundException('Treino não encontrado para esta aluna');

    const feedback = this.repo.create({
      ...dto,
      workoutId,
      studentId,
    });
    return this.repo.save(feedback);
  }

  async findByWorkout(workoutId: string, trainerId: string, page = 1, limit = 20) {
    const workout = await this.workoutRepo.findOneBy({ id: workoutId, personalTrainerId: trainerId });
    if (!workout) throw new NotFoundException('Treino não encontrado');

    const [data, total] = await this.repo.findAndCount({
      where: { workoutId },
      relations: ['student'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }
}
