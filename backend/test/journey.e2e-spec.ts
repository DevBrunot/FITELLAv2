import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/test-app';
import { ExerciseCategory } from '../src/entities/exercise.entity';
import { WorkoutType } from '../src/entities/workout.entity';
import { StudentStatus } from '../src/entities/student.entity';

describe('Fitela API — jornada completa (e2e)', () => {
  let app: INestApplication;
  let trainerToken: string;
  let studentToken: string;
  let exerciseId: string;
  let workoutId: string;
  let studentId: string;
  let registrationCode: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. cadastra personal trainer', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'trainer@fitela.com',
        password: 'senha123',
        name: 'Bruna Personal',
        phone: '11999999999',
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.role).toBe('trainer');
    trainerToken = res.body.accessToken;
  });

  it('2. faz login do personal trainer', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'trainer@fitela.com', password: 'senha123' })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    trainerToken = res.body.accessToken;
  });

  it('3. cria exercício', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/exercises')
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({
        name: 'Agachamento sumô',
        description: 'Fortalecimento de pernas',
        category: ExerciseCategory.STRENGTH,
        youtubeUrl: 'https://www.youtube.com/watch?v=abc123xyz',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Agachamento sumô');
    expect(res.body.videoId).toBe('abc123xyz');
    exerciseId = res.body.id;
  });

  it('4. lista exercícios', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/exercises')
      .set('Authorization', `Bearer ${trainerToken}`)
      .expect(200);

    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].name).toBe('Agachamento sumô');
  });

  it('5. busca exercício por id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/exercises/${exerciseId}`)
      .set('Authorization', `Bearer ${trainerToken}`)
      .expect(200);

    expect(res.body.id).toBe(exerciseId);
  });

  it('6. atualiza exercício', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/exercises/${exerciseId}`)
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ name: 'Agachamento sumô (atualizado)' })
      .expect(200);

    expect(res.body.name).toBe('Agachamento sumô (atualizado)');
  });

  it('7. cria link de registro', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/registration-links')
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({ linkType: 'permanent' })
      .expect(201);

    expect(res.body.code).toBeDefined();
    registrationCode = res.body.code;
  });

  it('8. cadastra aluna via link', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/student/register')
      .send({
        email: 'aluna@fitela.com',
        password: 'senha123',
        name: 'Ana Gestante',
        registrationCode,
      })
      .expect(201);

    expect(res.body.role).toBe('student');
    studentToken = res.body.accessToken;
  });

  it('9. lista alunas pendentes', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/students')
      .set('Authorization', `Bearer ${trainerToken}`)
      .expect(200);

    expect(res.body.total).toBeGreaterThanOrEqual(1);
    studentId = res.body.data[0].id;
    expect(res.body.data[0].status).toBe(StudentStatus.PENDING);
  });

  it('10. aprova aluna', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/students/${studentId}/approve`)
      .set('Authorization', `Bearer ${trainerToken}`)
      .expect(200);

    expect(res.body.status).toBe(StudentStatus.APPROVED);
  });

  it('11. cria treino com exercício', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/workouts')
      .set('Authorization', `Bearer ${trainerToken}`)
      .send({
        title: 'Treino gestacional — pernas',
        description: 'Treino leve',
        type: WorkoutType.GESTATIONAL,
        exercises: [{ exerciseId, sets: 3, reps: 12, restSeconds: 60 }],
      })
      .expect(201);

    expect(res.body.title).toBe('Treino gestacional — pernas');
    expect(res.body.workoutExercises?.length).toBe(1);
    workoutId = res.body.id;
  });

  it('12. lista treinos', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/workouts')
      .set('Authorization', `Bearer ${trainerToken}`)
      .expect(200);

    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('13. busca treino por id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/workouts/${workoutId}`)
      .set('Authorization', `Bearer ${trainerToken}`)
      .expect(200);

    expect(res.body.id).toBe(workoutId);
    expect(res.body.workoutExercises[0].exercise.name).toContain('Agachamento');
  });

  it('14. rejeita criação sem autenticação', async () => {
    await request(app.getHttpServer())
      .post('/api/exercises')
      .send({ name: 'Sem auth' })
      .expect(401);
  });

  it('15. remove exercício', async () => {
    await request(app.getHttpServer())
      .delete(`/api/exercises/${exerciseId}`)
      .set('Authorization', `Bearer ${trainerToken}`)
      .expect(204);
  });
});
