import { Controller, Post, Body } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvGateway } from './cv.gateway';

@Controller('cv')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly cvGateway: CvGateway,
  ) {}

  @Post('analyze')
  async analyzeFrame(@Body() body: any) {
    const analysis = await this.cvService.saveAnalysis(body);
    
    // Broadcast to doctor dashboard
    this.cvGateway.broadcastCvAnalysis(analysis);
    
    return { success: true, analysis };
  }
}
