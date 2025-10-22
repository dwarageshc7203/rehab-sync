import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IotReading } from './iot-reading.entity';

@Injectable()
export class IotService {
  constructor(
    @InjectRepository(IotReading)
    private iotReadingsRepository: Repository<IotReading>,
  ) {}

  async saveReading(sessionId: number, fsrValue: number, activationPercent: number): Promise<IotReading> {
    const reading = this.iotReadingsRepository.create({
      sessionId,
      fsrValue,
      activationPercent,
    });
    return this.iotReadingsRepository.save(reading);
  }

  async getSessionReadings(sessionId: number): Promise<IotReading[]> {
    return this.iotReadingsRepository.find({
      where: { sessionId },
      order: { timestamp: 'ASC' },
    });
  }
}
