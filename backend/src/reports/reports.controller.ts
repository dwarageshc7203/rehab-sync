import { Controller, Post, Get, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate/:sessionId')
  async generateReport(@Param('sessionId') sessionId: string) {
    return this.reportsService.generateReport(parseInt(sessionId));
  }

  @Get(':id')
  async getReport(@Param('id') id: string) {
    return this.reportsService.getReport(parseInt(id));
  }
}
