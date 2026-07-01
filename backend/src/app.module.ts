// file: src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Entities
import { PersonalTrainer } from './entities/personal-trainer.entity';
import { Student } from './entities/student.entity';
import { Exercise } from './entities/exercise.entity';
import { Workout } from './entities/workout.entity';
import { WorkoutExercise } from './entities/workout-exercise.entity';
import { Anamnesis } from './entities/anamnesis.entity';
import { RegistrationLink } from './entities/registration-link.entity';
import { WorkoutExecution } from './entities/workout-execution.entity';
import { WorkoutFeedback } from './entities/workout-feedback.entity';
import { Notification } from './entities/notification.entity';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { StudentsModule } from './modules/students/students.module';
import { AnamnesisModule } from './modules/anamnesis/anamnesis.module';
import { RegistrationLinksModule } from './modules/registration-links/registration-links.module';
import { UploadModule } from './modules/upload/upload.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { StudentWorkoutsModule } from './modules/student-workouts/student-workouts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { getDatabaseSsl } from './config/database';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          url,
          ssl: getDatabaseSsl(url),
          entities: [
            PersonalTrainer, Student, Exercise, Workout, WorkoutExercise,
            Anamnesis, RegistrationLink, WorkoutExecution, WorkoutFeedback, Notification,
          ],
          // ⚠️  synchronize: true apenas em desenvolvimento. Produção: use migrations.
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('NODE_ENV') === 'development',
        };
      },
    }),

    // Serve arquivos locais em /uploads — remover ao migrar para S3/GCS
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    ExercisesModule,
    WorkoutsModule,
    StudentsModule,
    AnamnesisModule,
    RegistrationLinksModule,
    UploadModule,
    FeedbackModule,
    NotificationsModule,
    StudentWorkoutsModule,
    DashboardModule,
  ],
})
export class AppModule {}
