// file: src/modules/anamnesis/anamnesis.controller.ts
import {
  Body, Controller, Get, Patch, Post, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnamnesisService } from './anamnesis.service';
import { CreateAnamnesisDto, UpdateAnamnesisDto } from './dto/anamnesis.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/anamnesis')
export class AnamnesisController {
  constructor(private service: AnamnesisService) {}

  /** POST /api/anamnesis — student creates her anamnesis */
  @Post()
  create(@Body() dto: CreateAnamnesisDto, @Request() req) {
    return this.service.create(dto, req.user.sub);
  }

  /** GET /api/anamnesis/me */
  @Get('me')
  findMe(@Request() req) {
    return this.service.findMine(req.user.sub);
  }

  /** PATCH /api/anamnesis/me */
  @Patch('me')
  update(@Body() dto: UpdateAnamnesisDto, @Request() req) {
    return this.service.updateMine(dto, req.user.sub);
  }
}
