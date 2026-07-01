// file: src/modules/anamnesis/anamnesis.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anamnesis } from '../../entities/anamnesis.entity';
import { AnamnesisController } from './anamnesis.controller';
import { AnamnesisService } from './anamnesis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Anamnesis])],
  controllers: [AnamnesisController],
  providers: [AnamnesisService],
})
export class AnamnesisModule {}
