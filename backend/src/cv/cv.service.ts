import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvAnalysis } from './cv-analysis.entity';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(CvAnalysis)
    private cvAnalysisRepository: Repository<CvAnalysis>,
  ) {}

  async saveAnalysis(data: any): Promise<CvAnalysis> {
    const analysis = this.cvAnalysisRepository.create(data);
    return this.cvAnalysisRepository.save(analysis);
  }

  async getSessionAnalysis(sessionId: number): Promise<CvAnalysis[]> {
    return this.cvAnalysisRepository.find({
      where: { sessionId },
      order: { timestamp: 'ASC' },
    });
  }
}
