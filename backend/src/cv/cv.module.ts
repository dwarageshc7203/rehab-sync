import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { CvGateway } from './cv.gateway';
import { CvAnalysis } from './cv-analysis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CvAnalysis])],
  controllers: [CvController],
  providers: [CvService, CvGateway],
  exports: [CvService],
})
export class CvModule {}
