// file: src/modules/registration-links/registration-links.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationLink, LinkType } from '../../entities/registration-link.entity';
import { CreateRegistrationLinkDto } from './dto/registration-link.dto';

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function generateCode(length = 8): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE62[Math.floor(Math.random() * BASE62.length)];
  }
  return result;
}

@Injectable()
export class RegistrationLinksService {
  constructor(
    @InjectRepository(RegistrationLink) private repo: Repository<RegistrationLink>,
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

  async create(dto: CreateRegistrationLinkDto, trainerId: string) {
    // Generate unique code
    let code: string;
    let attempts = 0;
    do {
      code = generateCode(8);
      attempts++;
      if (attempts > 10) throw new Error('Failed to generate unique code');
    } while (await this.repo.findOneBy({ code }));

    let expiresAt: Date | undefined;
    if (dto.linkType === LinkType.EXPIRABLE && dto.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + dto.expiresInDays);
    }

    const link = this.repo.create({
      code,
      linkType: dto.linkType ?? LinkType.PERMANENT,
      expiresAt,
      personalTrainerId: trainerId,
    });

    return this.repo.save(link);
  }

  async remove(id: string, trainerId: string) {
    const link = await this.repo.findOneBy({ id, personalTrainerId: trainerId });
    if (!link) throw new NotFoundException('Link não encontrado');
    link.isActive = false;
    await this.repo.save(link);
  }
}
