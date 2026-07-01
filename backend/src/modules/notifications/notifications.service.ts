// file: src/modules/notifications/notifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private repo: Repository<Notification>,
  ) {}

  async findAll(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: [
        { personalTrainerId: userId },
        { studentId: userId },
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async markRead(id: string, userId: string) {
    const notif = await this.repo.findOne({
      where: [
        { id, personalTrainerId: userId },
        { id, studentId: userId },
      ],
    });
    if (!notif) throw new NotFoundException('Notificação não encontrada');
    notif.isRead = true;
    notif.readAt = new Date();
    return this.repo.save(notif);
  }

  async markAllRead(userId: string) {
    await this.repo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('personalTrainerId = :userId OR studentId = :userId', { userId })
      .andWhere('isRead = false')
      .execute();
    return { success: true };
  }
}
