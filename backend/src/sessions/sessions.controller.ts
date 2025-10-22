import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start')
  async startSession(@Body() body: { patientId: number; doctorId: number }) {
    return this.sessionsService.startSession(body.patientId, body.doctorId);
  }

  @Post(':id/end')
  async endSession(@Param('id') id: string) {
    return this.sessionsService.endSession(parseInt(id));
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.sessionsService.getSession(parseInt(id));
  }
}
