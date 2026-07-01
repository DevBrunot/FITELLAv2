// file: src/modules/notifications/notifications.controller.ts
import {
  Controller, Get, Param, Patch, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@UseGuards(AuthGuard('jwt'))
@Controller('api/notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  /** GET /api/notifications */
  @Get()
  findAll(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findAll(req.user.sub, +page, +limit);
  }

  /** PATCH /api/notifications/:id/read */
  @Patch(':id/read')
  markRead(@Param('id') id: string, @Request() req) {
    return this.service.markRead(id, req.user.sub);
  }

  /** PATCH /api/notifications/read-all */
  @Patch('read-all')
  markAllRead(@Request() req) {
    return this.service.markAllRead(req.user.sub);
  }
}
