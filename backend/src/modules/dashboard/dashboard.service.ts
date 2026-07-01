// file: src/modules/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from '../../entities/student.entity';
import { Workout } from '../../entities/workout.entity';
import { WorkoutExecution, ExecutionStatus } from '../../entities/workout-execution.entity';
import { WorkoutFeedback } from '../../entities/workout-feedback.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    @InjectRepository(WorkoutExecution) private execRepo: Repository<WorkoutExecution>,
    @InjectRepository(WorkoutFeedback) private feedbackRepo: Repository<WorkoutFeedback>,
  ) {}

  async getMetrics(trainerId: string) {
    const [totalStudents, pendingStudents, totalWorkouts, completedExecutions] =
      await Promise.all([
        this.studentRepo.count({ where: { personalTrainerId: trainerId } }),
        this.studentRepo.count({
          where: { personalTrainerId: trainerId, status: StudentStatus.PENDING },
        }),
        this.workoutRepo.count({ where: { personalTrainerId: trainerId } }),
        this.execRepo
          .createQueryBuilder('e')
          .innerJoin('e.workout', 'w', 'w.personalTrainerId = :trainerId', { trainerId })
          .where('e.status = :status', { status: ExecutionStatus.COMPLETED })
          .getCount(),
      ]);

    return {
      totalStudents,
      pendingStudents,
      approvedStudents: totalStudents - pendingStudents,
      totalWorkouts,
      completedExecutions,
    };
  }

  async getRecentFeedbacks(trainerId: string, limit = 10) {
    return this.feedbackRepo
      .createQueryBuilder('f')
      .innerJoin('f.workout', 'w', 'w.personalTrainerId = :trainerId', { trainerId })
      .innerJoinAndSelect('f.student', 'student')
      .innerJoinAndSelect('f.workout', 'workout')
      .orderBy('f.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }
}
