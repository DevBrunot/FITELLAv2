import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkoutsService } from './workouts.service';
import { Workout, WorkoutType } from '../../entities/workout.entity';
import { WorkoutExercise } from '../../entities/workout-exercise.entity';
import { Exercise } from '../../entities/exercise.entity';
import { Student } from '../../entities/student.entity';
import { Notification } from '../../entities/notification.entity';

describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let workoutRepo: Record<string, jest.Mock>;
  let weRepo: Record<string, jest.Mock>;
  let exerciseRepo: Record<string, jest.Mock>;

  const trainerId = 'trainer-1';
  const exerciseId = 'exercise-1';

  beforeEach(async () => {
    workoutRepo = {
      create: jest.fn((dto) => ({ ...dto })),
      save: jest.fn(async (entity) => ({ id: 'workout-1', ...entity })),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
    };
    weRepo = { create: jest.fn((dto) => ({ ...dto })) };
    exerciseRepo = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        { provide: getRepositoryToken(Workout), useValue: workoutRepo },
        { provide: getRepositoryToken(WorkoutExercise), useValue: weRepo },
        { provide: getRepositoryToken(Exercise), useValue: exerciseRepo },
        { provide: getRepositoryToken(Student), useValue: { findOneBy: jest.fn() } },
        { provide: getRepositoryToken(Notification), useValue: { create: jest.fn(), save: jest.fn() } },
      ],
    }).compile();

    service = module.get(WorkoutsService);
  });

  describe('create', () => {
    it('cria treino com exercícios', async () => {
      exerciseRepo.find.mockResolvedValue([
        { id: exerciseId, name: 'Agachamento', postPartumOnly: false, personalTrainerId: trainerId },
      ]);
      workoutRepo.save.mockImplementation(async (w) => w);

      const result = await service.create(
        {
          title: 'Treino A',
          description: 'Pernas',
          type: WorkoutType.GENERAL,
          exercises: [{ exerciseId, sets: 3, reps: 12 }],
        },
        trainerId,
      );

      expect(result.title).toBe('Treino A');
      expect(result.personalTrainerId).toBe(trainerId);
      expect(weRepo.create).toHaveBeenCalled();
    });

    it('bloqueia exercício pós-parto em treino gestacional', async () => {
      exerciseRepo.find.mockResolvedValue([
        { id: exerciseId, name: 'Abdominal', postPartumOnly: true, personalTrainerId: trainerId },
      ]);

      await expect(
        service.create(
          {
            title: 'Treino gestacional',
            type: WorkoutType.GESTATIONAL,
            exercises: [{ exerciseId, sets: 3, reps: 10 }],
          },
          trainerId,
        ),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('falha se exercício não existir', async () => {
      exerciseRepo.find.mockResolvedValue([]);

      await expect(
        service.create(
          { title: 'Treino inválido', exercises: [{ exerciseId, sets: 3, reps: 10 }] },
          trainerId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('retorna treino existente', async () => {
      const workout = { id: 'workout-1', title: 'Treino' };
      workoutRepo.findOne.mockResolvedValue(workout);

      const result = await service.findOne('workout-1', trainerId);

      expect(result).toEqual(workout);
    });

    it('lança NotFoundException se não existir', async () => {
      workoutRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid', trainerId)).rejects.toThrow(NotFoundException);
    });
  });
});
