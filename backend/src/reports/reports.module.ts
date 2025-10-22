import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from './report.entity';
import { IotModule } from '../iot/iot.module';
import { CvModule } from '../cv/cv.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), IotModule, CvModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
