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

async saveAnalysis(data: Partial<CvAnalysis>[]): Promise<CvAnalysis[]> {
  const analysisEntities = data.map(d => this.cvAnalysisRepository.create(d));
  return await this.cvAnalysisRepository.save(analysisEntities);
}

  async getSessionAnalysis(sessionId: number): Promise<CvAnalysis[]> {
    return this.cvAnalysisRepository.find({
      where: { sessionId },
      order: { timestamp: 'ASC' },
    });
  }
}
