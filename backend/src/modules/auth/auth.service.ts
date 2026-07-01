// file: src/modules/auth/auth.service.ts
import {
  Injectable, UnauthorizedException, ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PersonalTrainer } from '../../entities/personal-trainer.entity';
import { Student, StudentStatus } from '../../entities/student.entity';
import { RegistrationLink, LinkType } from '../../entities/registration-link.entity';
import {
  AuthLoginDto, AuthRegisterDto, StudentRegisterDto, StudentLoginDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PersonalTrainer)
    private trainerRepo: Repository<PersonalTrainer>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(RegistrationLink)
    private linkRepo: Repository<RegistrationLink>,
    private jwtService: JwtService,
  ) {}

  // ── Personal Trainer ──────────────────────────────────────────────

  async registerTrainer(dto: AuthRegisterDto) {
    const exists = await this.trainerRepo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const trainer = this.trainerRepo.create({ ...dto, passwordHash });
    await this.trainerRepo.save(trainer);
    return this.signToken('trainer', trainer.id, trainer.email);
  }

  async loginTrainer(dto: AuthLoginDto) {
    const trainer = await this.trainerRepo.findOneBy({ email: dto.email });
    if (!trainer || !(await bcrypt.compare(dto.password, trainer.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.signToken('trainer', trainer.id, trainer.email);
  }

  // ── Student ───────────────────────────────────────────────────────

  async registerStudent(dto: StudentRegisterDto) {
    const link = await this.linkRepo.findOne({
      where: { code: dto.registrationCode, isActive: true },
      relations: ['personalTrainer'],
    });

    if (!link) throw new BadRequestException('Código de registro inválido ou inativo');

    if (link.linkType === LinkType.EXPIRABLE && link.expiresAt && link.expiresAt < new Date()) {
      throw new BadRequestException('Código de registro expirado');
    }

    const exists = await this.studentRepo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const student = this.studentRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      phone: dto.phone,
      registrationCode: dto.registrationCode,
      personalTrainerId: link.personalTrainerId,
      status: StudentStatus.PENDING,
    });
    await this.studentRepo.save(student);
    return this.signToken('student', student.id, student.email);
  }

  async loginStudent(dto: StudentLoginDto) {
    const student = await this.studentRepo.findOneBy({ email: dto.email });
    if (!student || !(await bcrypt.compare(dto.password, student.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.signToken('student', student.id, student.email);
  }

  // ── Helpers ───────────────────────────────────────────────────────

  private signToken(role: string, sub: string, email: string) {
    const payload = { sub, email, role };
    return { accessToken: this.jwtService.sign(payload), role };
  }
}
