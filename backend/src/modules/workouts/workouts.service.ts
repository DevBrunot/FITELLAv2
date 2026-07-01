// file: src/modules/workouts/workouts.service.ts
import {
  Injectable, NotFoundException, UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Workout, WorkoutType } from '../../entities/workout.entity';
import { WorkoutExercise } from '../../entities/workout-exercise.entity';
import { Exercise } from '../../entities/exercise.entity';
import { Student } from '../../entities/student.entity';
import { Notification, NotificationTarget } from '../../entities/notification.entity';
import { CreateWorkoutDto, UpdateWorkoutDto, SendWorkoutDto } from './dto/workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Workout) private repo: Repository<Workout>,
    @InjectRepository(WorkoutExercise) private weRepo: Repository<WorkoutExercise>,
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async findAll(trainerId: string, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { personalTrainerId: trainerId },
      relations: ['workoutExercises', 'workoutExercises.exercise'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string, trainerId: string) {
    const workout = await this.repo.findOne({
      where: { id, personalTrainerId: trainerId },
      relations: ['workoutExercises', 'workoutExercises.exercise', 'student'],
    });
    if (!workout) throw new NotFoundException('Treino não encontrado');
    return workout;
  }

  async create(dto: CreateWorkoutDto, trainerId: string) {
    const workout = this.repo.create({
      title: dto.title,
      description: dto.description,
      type: dto.type ?? WorkoutType.GENERAL,
      isTemplate: dto.isTemplate ?? false,
      personalTrainerId: trainerId,
    });

    if (dto.exercises?.length) {
      const ids = dto.exercises.map((e) => e.exerciseId);
      const foundExercises = await this.exerciseRepo.find({
        where: { id: In(ids), personalTrainerId: trainerId },
      });

      if (foundExercises.length !== ids.length) {
        throw new NotFoundException('Um ou mais exercícios não encontrados');
      }

      // Block postPartumOnly exercises in gestational workouts
      if (workout.type === WorkoutType.GESTATIONAL) {
        const blocked = foundExercises.filter((e) => e.postPartumOnly);
        if (blocked.length > 0) {
          throw new UnprocessableEntityException(
            `Exercícios pós-parto não podem ser adicionados a treinos gestacionais: ${blocked.map((e) => e.name).join(', ')}`,
          );
        }
      }

      workout.workoutExercises = dto.exercises.map((item, idx) => {
        const we = this.weRepo.create({
          exerciseId: item.exerciseId,
          sets: item.sets ?? 3,
          useTime: item.useTime ?? false,
          reps: item.reps,
          timeOn: item.timeOn,
          restSeconds: item.restSeconds,
          notes: item.notes,
          order: item.order ?? idx,
        });
        return we;
      });

      workout.estimatedDurationMinutes = this.calcDuration(workout.workoutExercises, foundExercises);
    }

    return this.repo.save(workout);
  }

  async update(id: string, dto: UpdateWorkoutDto, trainerId: string) {
    const workout = await this.findOne(id, trainerId);
    Object.assign(workout, {
      title: dto.title ?? workout.title,
      description: dto.description ?? workout.description,
      type: dto.type ?? workout.type,
      isTemplate: dto.isTemplate ?? workout.isTemplate,
    });

    if (dto.exercises) {
      const ids = dto.exercises.map((e) => e.exerciseId);
      const foundExercises = await this.exerciseRepo.find({
        where: { id: In(ids), personalTrainerId: trainerId },
      });

      if (foundExercises.length !== ids.length) {
        throw new NotFoundException('Um ou mais exercícios não encontrados');
      }

      const type = dto.type ?? workout.type;
      if (type === WorkoutType.GESTATIONAL) {
        const blocked = foundExercises.filter((e) => e.postPartumOnly);
        if (blocked.length > 0) {
          throw new UnprocessableEntityException(
            `Exercícios pós-parto não podem ser adicionados a treinos gestacionais: ${blocked.map((e) => e.name).join(', ')}`,
          );
        }
      }

      // Replace exercises
      await this.weRepo.delete({ workoutId: id });
      workout.workoutExercises = dto.exercises.map((item, idx) =>
        this.weRepo.create({
          workoutId: id,
          exerciseId: item.exerciseId,
          sets: item.sets ?? 3,
          useTime: item.useTime ?? false,
          reps: item.reps,
          timeOn: item.timeOn,
          restSeconds: item.restSeconds,
          notes: item.notes,
          order: item.order ?? idx,
        }),
      );
      workout.estimatedDurationMinutes = this.calcDuration(workout.workoutExercises, foundExercises);
    }

    return this.repo.save(workout);
  }

  async remove(id: string, trainerId: string) {
    const workout = await this.findOne(id, trainerId);
    await this.repo.remove(workout);
  }

  /** POST /workouts/:id/save-template — clone workout as template */
  async saveAsTemplate(id: string, trainerId: string) {
    const original = await this.findOne(id, trainerId);
    const template = this.repo.create({
      title: `[Template] ${original.title}`,
      description: original.description,
      type: original.type,
      estimatedDurationMinutes: original.estimatedDurationMinutes,
      isTemplate: true,
      personalTrainerId: original.personalTrainerId,
      workoutExercises: original.workoutExercises.map((we) =>
        this.weRepo.create({
          exerciseId: we.exerciseId,
          sets: we.sets,
          useTime: we.useTime,
          reps: we.reps,
          timeOn: we.timeOn,
          restSeconds: we.restSeconds,
          notes: we.notes,
          order: we.order,
        }),
      ),
    });
    return this.repo.save(template);
  }

  /** POST /workouts/:id/send — assign workout to one or more students */
  async sendToStudent(id: string, dto: SendWorkoutDto, trainerId: string) {
    const original = await this.findOne(id, trainerId);
    const studentIds = [...new Set(dto.studentIds)];

    const students = await this.studentRepo.find({
      where: { id: In(studentIds), personalTrainerId: trainerId },
    });
    if (students.length !== studentIds.length) {
      throw new NotFoundException('Uma ou mais alunas não encontradas');
    }

    const studentMap = new Map(students.map((s) => [s.id, s]));
    const sentAt = new Date();
    const sent: { studentId: string; workoutId: string }[] = [];

    const assignAndNotify = async (workout: Workout, studentId: string) => {
      workout.studentId = studentId;
      workout.sentAt = sentAt;
      workout.isTemplate = false;
      const saved = await this.repo.save(workout);
      const student = studentMap.get(studentId)!;

      await this.notifRepo.save([
        this.notifRepo.create({
          target: NotificationTarget.TRAINER,
          personalTrainerId: trainerId,
          title: 'Treino enviado',
          body: `Treino "${saved.title}" foi enviado para ${student.name}.`,
          type: 'workout_sent',
        }),
        this.notifRepo.create({
          target: NotificationTarget.STUDENT,
          studentId,
          title: 'Novo treino disponível',
          body: `Você recebeu o treino "${saved.title}". Acesse agora!`,
          type: 'workout_received',
        }),
      ]);

      sent.push({ studentId, workoutId: saved.id });
    };

    if (original.isTemplate) {
      for (const studentId of studentIds) {
        const clone = this.cloneWorkout(original, { studentId, sentAt });
        await assignAndNotify(clone, studentId);
      }
    } else if (studentIds.length === 1) {
      await assignAndNotify(original, studentIds[0]);
    } else {
      await assignAndNotify(original, studentIds[0]);
      for (const studentId of studentIds.slice(1)) {
        const clone = this.cloneWorkout(original, { studentId, sentAt });
        await assignAndNotify(clone, studentId);
      }
    }

    return { sentAt, sent, count: sent.length };
  }

  private cloneWorkout(
    source: Workout,
    opts: { studentId: string; sentAt: Date },
  ): Workout {
    return this.repo.create({
      title: source.title,
      description: source.description,
      type: source.type,
      estimatedDurationMinutes: source.estimatedDurationMinutes,
      isTemplate: false,
      personalTrainerId: source.personalTrainerId,
      studentId: opts.studentId,
      sentAt: opts.sentAt,
      workoutExercises: source.workoutExercises.map((we) =>
        this.weRepo.create({
          exerciseId: we.exerciseId,
          sets: we.sets,
          useTime: we.useTime,
          reps: we.reps,
          timeOn: we.timeOn,
          restSeconds: we.restSeconds,
          notes: we.notes,
          order: we.order,
        }),
      ),
    });
  }

  /** Rough duration estimate: sum sets * (timeOn or 30s) + restSeconds, in minutes */
  private calcDuration(
    workoutExercises: WorkoutExercise[],
    exercises: Exercise[],
  ): number {
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
    let total = 0;
    for (const we of workoutExercises) {
      const ex = exerciseMap.get(we.exerciseId);
      const setDuration = we.useTime ? (we.timeOn ?? 30) : (ex?.durationSeconds ?? 30);
      const rest = we.restSeconds ?? 30;
      total += we.sets * setDuration + (we.sets - 1) * rest;
    }
    return Math.ceil(total / 60);
  }
}
