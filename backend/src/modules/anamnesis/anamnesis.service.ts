// file: src/modules/anamnesis/anamnesis.service.ts
import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anamnesis } from '../../entities/anamnesis.entity';
import { CreateAnamnesisDto, UpdateAnamnesisDto } from './dto/anamnesis.dto';

@Injectable()
export class AnamnesisService {
  constructor(
    @InjectRepository(Anamnesis) private repo: Repository<Anamnesis>,
  ) {}

  async create(dto: CreateAnamnesisDto, studentId: string) {
    const existing = await this.repo.findOneBy({ studentId });
    if (existing) throw new ConflictException('Anamnese já cadastrada para esta aluna');

    const anamnesis = this.repo.create({
      ...dto,
      studentId,
      lgpdConsentAt: dto.lgpdConsent ? new Date() : undefined,
    });
    return this.repo.save(anamnesis);
  }

  async findMine(studentId: string) {
    const anamnesis = await this.repo.findOneBy({ studentId });
    if (!anamnesis) throw new NotFoundException('Anamnese não encontrada');
    return anamnesis;
  }

  async updateMine(dto: UpdateAnamnesisDto, studentId: string) {
    const anamnesis = await this.findMine(studentId);
    Object.assign(anamnesis, dto);
    return this.repo.save(anamnesis);
  }
}
