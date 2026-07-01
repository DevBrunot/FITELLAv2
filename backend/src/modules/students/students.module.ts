// file: src/modules/students/students.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { Notification } from '../../entities/notification.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Notification])],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
