import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
import { IotGateway } from './iot.gateway';
import { IotReading } from './iot-reading.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IotReading])],
  controllers: [IotController],
  providers: [IotService, IotGateway],
  exports: [IotService],
})
export class IotModule {}
