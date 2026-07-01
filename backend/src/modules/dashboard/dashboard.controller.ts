// file: src/modules/dashboard/dashboard.controller.ts
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@UseGuards(AuthGuard('jwt'))
@Controller('api/dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  /** GET /api/dashboard/metrics */
  @Get('metrics')
  metrics(@Request() req) {
    return this.service.getMetrics(req.user.sub);
  }

  /** GET /api/dashboard/feedbacks */
  @Get('feedbacks')
  feedbacks(@Request() req) {
    return this.service.getRecentFeedbacks(req.user.sub);
  }
}
