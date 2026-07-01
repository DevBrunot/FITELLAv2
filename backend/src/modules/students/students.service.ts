// file: src/modules/students/students.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from '../../entities/student.entity';
import { Notification, NotificationTarget } from '../../entities/notification.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private repo: Repository<Student>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async findAll(trainerId: string, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { personalTrainerId: trainerId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string, trainerId: string) {
    const student = await this.repo.findOne({
      where: { id, personalTrainerId: trainerId },
      relations: ['anamnesis'],
    });
    if (!student) throw new NotFoundException('Aluna não encontrada');
    return student;
  }

  async getAnamnesis(id: string, trainerId: string) {
    const student = await this.findOne(id, trainerId);
    return student.anamnesis ?? null;
  }

  async getWorkouts(id: string, trainerId: string, page = 1, limit = 20) {
    const student = await this.findOne(id, trainerId);
    return student; // workouts loaded separately by WorkoutsService if needed
  }

  async approve(id: string, trainerId: string) {
    return this.updateStatus(id, trainerId, StudentStatus.APPROVED, 'Parabéns! Sua conta foi aprovada. Acesse seus treinos.');
  }

  async reject(id: string, trainerId: string) {
    return this.updateStatus(id, trainerId, StudentStatus.REJECTED, 'Sua solicitação de acesso foi recusada. Entre em contato com seu personal.');
  }

  private async updateStatus(
    id: string,
    trainerId: string,
    status: StudentStatus,
    notifBody: string,
  ) {
    const student = await this.findOne(id, trainerId);
    student.status = status;
    await this.repo.save(student);

    await this.notifRepo.save(
      this.notifRepo.create({
        target: NotificationTarget.STUDENT,
        studentId: id,
        title: status === StudentStatus.APPROVED ? 'Conta aprovada!' : 'Acesso recusado',
        body: notifBody,
        type: `student_${status}`,
      }),
    );

    return student;
  }
}
