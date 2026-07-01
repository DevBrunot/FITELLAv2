import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PersonalTrainer } from '../../entities/personal-trainer.entity';
import { Student, StudentStatus } from '../../entities/student.entity';
import { RegistrationLink, LinkType } from '../../entities/registration-link.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let trainerRepo: Record<string, jest.Mock>;
  let studentRepo: Record<string, jest.Mock>;
  let linkRepo: Record<string, jest.Mock>;
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    trainerRepo = {
      findOneBy: jest.fn(),
      create: jest.fn((dto) => ({ ...dto })),
      save: jest.fn(async (entity) => ({ id: 'trainer-1', ...entity })),
    };
    studentRepo = {
      findOneBy: jest.fn(),
      create: jest.fn((dto) => ({ ...dto })),
      save: jest.fn(async (entity) => ({ id: 'student-1', ...entity })),
    };
    linkRepo = { findOne: jest.fn() };
    jwtService = { sign: jest.fn(() => 'fake-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(PersonalTrainer), useValue: trainerRepo },
        { provide: getRepositoryToken(Student), useValue: studentRepo },
        { provide: getRepositoryToken(RegistrationLink), useValue: linkRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('registerTrainer', () => {
    it('cadastra personal trainer com sucesso', async () => {
      trainerRepo.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.registerTrainer({
        email: 'trainer@test.com',
        password: '123456',
        name: 'Maria Personal',
      });

      expect(result.accessToken).toBe('fake-token');
      expect(result.role).toBe('trainer');
      expect(trainerRepo.save).toHaveBeenCalled();
    });

    it('rejeita e-mail duplicado', async () => {
      trainerRepo.findOneBy.mockResolvedValue({ id: '1' });

      await expect(
        service.registerTrainer({
          email: 'trainer@test.com',
          password: '123456',
          name: 'Maria',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('loginTrainer', () => {
    it('autentica personal com credenciais válidas', async () => {
      trainerRepo.findOneBy.mockResolvedValue({
        id: 'trainer-1',
        email: 'trainer@test.com',
        passwordHash: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.loginTrainer({
        email: 'trainer@test.com',
        password: '123456',
      });

      expect(result.accessToken).toBe('fake-token');
      expect(result.role).toBe('trainer');
    });

    it('rejeita credenciais inválidas', async () => {
      trainerRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.loginTrainer({ email: 'x@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('registerStudent', () => {
    it('cadastra aluna com código válido', async () => {
      linkRepo.findOne.mockResolvedValue({
        code: 'ABC12345',
        isActive: true,
        personalTrainerId: 'trainer-1',
        linkType: LinkType.PERMANENT,
      });
      studentRepo.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.registerStudent({
        email: 'aluna@test.com',
        password: '123456',
        name: 'Ana',
        registrationCode: 'ABC12345',
      });

      expect(result.role).toBe('student');
      expect(studentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: StudentStatus.PENDING }),
      );
    });

    it('rejeita código inválido', async () => {
      linkRepo.findOne.mockResolvedValue(null);

      await expect(
        service.registerStudent({
          email: 'aluna@test.com',
          password: '123456',
          name: 'Ana',
          registrationCode: 'INVALID',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
