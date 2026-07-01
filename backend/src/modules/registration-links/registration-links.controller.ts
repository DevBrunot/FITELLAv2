// file: src/modules/registration-links/registration-links.controller.ts
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegistrationLinksService } from './registration-links.service';
import { CreateRegistrationLinkDto } from './dto/registration-link.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/registration-links')
export class RegistrationLinksController {
  constructor(private service: RegistrationLinksService) {}

  /** GET /api/registration-links */
  @Get()
  findAll(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findAll(req.user.sub, +page, +limit);
  }

  /** POST /api/registration-links */
  @Post()
  create(@Body() dto: CreateRegistrationLinkDto, @Request() req) {
    return this.service.create(dto, req.user.sub);
  }

  /** DELETE /api/registration-links/:id (soft-delete: isActive = false) */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.sub);
  }
}
