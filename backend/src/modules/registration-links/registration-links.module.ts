// file: src/modules/registration-links/registration-links.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationLink } from '../../entities/registration-link.entity';
import { RegistrationLinksController } from './registration-links.controller';
import { RegistrationLinksService } from './registration-links.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistrationLink])],
  controllers: [RegistrationLinksController],
  providers: [RegistrationLinksService],
})
export class RegistrationLinksModule {}
