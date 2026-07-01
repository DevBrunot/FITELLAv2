import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { ExercisesModule } from '../../src/modules/exercises/exercises.module';
import { WorkoutsModule } from '../../src/modules/workouts/workouts.module';
import { RegistrationLinksModule } from '../../src/modules/registration-links/registration-links.module';
import { StudentsModule } from '../../src/modules/students/students.module';
import { PersonalTrainer } from '../../src/entities/personal-trainer.entity';
import { Student } from '../../src/entities/student.entity';
import { Exercise } from '../../src/entities/exercise.entity';
import { Workout } from '../../src/entities/workout.entity';
import { WorkoutExercise } from '../../src/entities/workout-exercise.entity';
import { RegistrationLink } from '../../src/entities/registration-link.entity';
import { Notification } from '../../src/entities/notification.entity';
import { createInMemoryRepository } from './in-memory-repository';

export async function createTestApp() {
  const trainerRepo = createInMemoryRepository<PersonalTrainer>();
  const studentRepo = createInMemoryRepository<Student>();
  const exerciseRepo = createInMemoryRepository<Exercise>();
  const baseWorkoutRepo = createInMemoryRepository<Workout>();
  const workoutExerciseRepo = createInMemoryRepository<WorkoutExercise>();
  const linkRepo = createInMemoryRepository<RegistrationLink>();
  const notificationRepo = createInMemoryRepository<Notification>();

  const workoutRepo = enhanceWorkoutRepo(
    baseWorkoutRepo,
    workoutExerciseRepo,
    exerciseRepo,
    studentRepo,
  );

  const originalLinkSave = linkRepo.save.bind(linkRepo);
  linkRepo.save = async (entity) => {
    if (entity.isActive === undefined) entity.isActive = true;
    return originalLinkSave(entity);
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [() => ({ JWT_SECRET: 'test-jwt-secret', NODE_ENV: 'test' })],
      }),
      AuthModule,
      ExercisesModule,
      WorkoutsModule,
      RegistrationLinksModule,
      StudentsModule,
    ],
  })
    .overrideProvider(getRepositoryToken(PersonalTrainer))
    .useValue(trainerRepo)
    .overrideProvider(getRepositoryToken(Student))
    .useValue(studentRepo)
    .overrideProvider(getRepositoryToken(Exercise))
    .useValue(exerciseRepo)
    .overrideProvider(getRepositoryToken(Workout))
    .useValue(workoutRepo)
    .overrideProvider(getRepositoryToken(WorkoutExercise))
    .useValue(workoutExerciseRepo)
    .overrideProvider(getRepositoryToken(RegistrationLink))
    .useValue(linkRepo)
    .overrideProvider(getRepositoryToken(Notification))
    .useValue(notificationRepo)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  return {
    app,
    repos: {
      trainerRepo,
      studentRepo,
      exerciseRepo,
      workoutRepo,
      workoutExerciseRepo,
      linkRepo,
      notificationRepo,
    },
  };
}

function enhanceWorkoutRepo(
  workoutRepo: ReturnType<typeof createInMemoryRepository<Workout>>,
  workoutExerciseRepo: ReturnType<typeof createInMemoryRepository<WorkoutExercise>>,
  exerciseRepo: ReturnType<typeof createInMemoryRepository<Exercise>>,
  studentRepo: ReturnType<typeof createInMemoryRepository<Student>>,
) {
  const attachRelations = (workout: Workout): Workout => ({
    ...workout,
    workoutExercises: workoutExerciseRepo.items
      .filter((we) => we.workoutId === workout.id)
      .map((we) => ({
        ...we,
        exercise: exerciseRepo.items.find((e) => e.id === we.exerciseId)!,
      })) as WorkoutExercise[],
    student: workout.studentId
      ? studentRepo.items.find((s) => s.id === workout.studentId)
      : undefined,
  } as Workout);

  const originalSave = workoutRepo.save.bind(workoutRepo);
  workoutRepo.save = async (workout: Workout) => {
    const nested = workout.workoutExercises;
    const saved = await originalSave({ ...workout, workoutExercises: undefined });
    if (nested?.length) {
      for (const we of nested) {
        await workoutExerciseRepo.save({ ...we, workoutId: saved.id });
      }
    }
    return attachRelations(saved);
  };

  const originalFindOne = workoutRepo.findOne.bind(workoutRepo);
  (workoutRepo as any).findOne = async (options: Parameters<typeof originalFindOne>[0]) => {
    const workout = await originalFindOne(options);
    return workout ? attachRelations(workout) : null;
  };

  const originalFindAndCount = workoutRepo.findAndCount.bind(workoutRepo);
  workoutRepo.findAndCount = async (options) => {
    const [data, total] = await originalFindAndCount(options);
    return [data.map(attachRelations), total];
  };

  return workoutRepo;
}
