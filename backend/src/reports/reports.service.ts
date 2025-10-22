import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { IotService } from '../iot/iot.service';
import { CvService } from '../cv/cv.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    private iotService: IotService,
    private cvService: CvService,
  ) {}

  async generateReport(sessionId: number): Promise<Report> {
    // Get IoT and CV data
    const iotReadings = await this.iotService.getSessionReadings(sessionId);
    const cvAnalyses = await this.cvService.getSessionAnalysis(sessionId);

    // Calculate metrics
    const totalReps = cvAnalyses.length > 0 ? cvAnalyses[cvAnalyses.length - 1].repCount : 0;
    
    const avgAccuracy = cvAnalyses.length > 0
      ? cvAnalyses.reduce((sum, a) => sum + a.accuracyScore, 0) / cvAnalyses.length
      : 0;

    const avgMuscleActivation = iotReadings.length > 0
      ? iotReadings.reduce((sum, r) => sum + r.activationPercent, 0) / iotReadings.length
      : 0;

    const peakMuscleActivation = iotReadings.length > 0
      ? Math.max(...iotReadings.map(r => r.activationPercent))
      : 0;

    // Collect issues
    const issuesSet = new Set<string>();
    cvAnalyses.forEach(analysis => {
      analysis.issuesDetected.forEach(issue => issuesSet.add(issue));
    });
    const issuesDetected = Array.from(issuesSet);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      avgAccuracy,
      avgMuscleActivation,
      issuesDetected
    );

    // Save report
    const report = this.reportsRepository.create({
      sessionId,
      totalReps,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100,
      avgMuscleActivation: Math.round(avgMuscleActivation * 100) / 100,
      peakMuscleActivation: Math.round(peakMuscleActivation * 100) / 100,
      issuesDetected,
      recommendations,
    });

    return this.reportsRepository.save(report);
  }

  async getReport(id: number): Promise<Report> {
    return this.reportsRepository.findOne({ where: { id } });
  }

  private generateRecommendations(
    avgAccuracy: number,
    avgMuscleActivation: number,
    issues: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (avgAccuracy < 70) {
      recommendations.push('Focus on form - slow down movements to ensure proper technique');
    }

    if (avgMuscleActivation < 40) {
      recommendations.push('Increase resistance or weight to improve muscle engagement');
    }

    if (issues.includes('shoulder_movement')) {
      recommendations.push('Keep shoulders stable - avoid swinging motion');
    }

    if (issues.includes('incomplete_extension')) {
      recommendations.push('Ensure full arm extension at the bottom of each rep');
    }

    if (issues.includes('incomplete_flexion')) {
      recommendations.push('Complete the curl - bring hand closer to shoulder');
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent form! Continue current technique');
    }

    return recommendations;
  }
}
