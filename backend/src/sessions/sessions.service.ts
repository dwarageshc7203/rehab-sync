import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}

  async startSession(patientId: number, doctorId: number): Promise<Session> {
    const session = this.sessionsRepository.create({
      patientId,
      doctorId,
      exerciseType: 'bicep_curls',
      status: 'active',
    });
    return this.sessionsRepository.save(session);
  }

  async endSession(id: number): Promise<Session> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) throw new Error('Session not found');

    const duration = Math.floor(
      (new Date().getTime() - session.startedAt.getTime()) / 1000
    );

    session.status = 'completed';
    session.endedAt = new Date();
    session.durationSeconds = duration;

    return this.sessionsRepository.save(session);
  }

  async getSession(id: number): Promise<Session> {
    return this.sessionsRepository.findOne({ where: { id } });
  }
}
