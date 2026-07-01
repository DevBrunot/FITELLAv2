import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExercisesService } from './exercises.service';
import { Exercise, ExerciseCategory } from '../../entities/exercise.entity';

describe('ExercisesService', () => {
  let service: ExercisesService;
  let repo: Record<string, jest.Mock>;

  const trainerId = 'trainer-1';

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto) => ({ ...dto })),
      save: jest.fn(async (entity) => ({ id: 'exercise-1', ...entity })),
      findOneBy: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: getRepositoryToken(Exercise), useValue: repo },
      ],
    }).compile();

    service = module.get(ExercisesService);
  });

  describe('create', () => {
    it('cria exercício com dados básicos', async () => {
      const dto = {
        name: 'Agachamento sumô',
        description: 'Exercício para pernas',
        category: ExerciseCategory.STRENGTH,
      };

      const result = await service.create(dto, trainerId);

      expect(repo.create).toHaveBeenCalledWith({ ...dto, personalTrainerId: trainerId });
      expect(repo.save).toHaveBeenCalled();
      expect(result.name).toBe(dto.name);
      expect(result.personalTrainerId).toBe(trainerId);
    });

    it('extrai videoId e thumbnail do YouTube', async () => {
      repo.save.mockImplementation(async (entity) => entity);

      const result = await service.create(
        {
          name: 'Alongamento',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        trainerId,
      );

      expect(result.videoId).toBe('dQw4w9WgXcQ');
      expect(result.thumbnail).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      );
    });

    it('marca exercício como pós-parto', async () => {
      repo.save.mockImplementation(async (entity) => entity);

      const result = await service.create(
        { name: 'Abdominal', postPartumOnly: true },
        trainerId,
      );

      expect(result.postPartumOnly).toBe(true);
    });
  });

  describe('findAll', () => {
    it('lista exercícios paginados do personal', async () => {
      const exercises = [{ id: '1', name: 'Ex A' }];
      repo.findAndCount.mockResolvedValue([exercises, 1]);

      const result = await service.findAll(trainerId, 1, 20);

      expect(repo.findAndCount).toHaveBeenCalledWith({
        where: { personalTrainerId: trainerId },
        skip: 0,
        take: 20,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toEqual(exercises);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('retorna exercício existente', async () => {
      const exercise = { id: 'exercise-1', name: 'Teste' };
      repo.findOneBy.mockResolvedValue(exercise);

      const result = await service.findOne('exercise-1', trainerId);

      expect(result).toEqual(exercise);
    });

    it('lança NotFoundException se não existir', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('invalid', trainerId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza exercício existente', async () => {
      const exercise = { id: 'exercise-1', name: 'Antigo', personalTrainerId: trainerId };
      repo.findOneBy.mockResolvedValue(exercise);
      repo.save.mockImplementation(async (entity) => entity);

      const result = await service.update('exercise-1', { name: 'Novo nome' }, trainerId);

      expect(result.name).toBe('Novo nome');
    });
  });

  describe('remove', () => {
    it('remove exercício existente', async () => {
      const exercise = { id: 'exercise-1', name: 'Remover' };
      repo.findOneBy.mockResolvedValue(exercise);

      await service.remove('exercise-1', trainerId);

      expect(repo.remove).toHaveBeenCalledWith(exercise);
    });
  });
});
