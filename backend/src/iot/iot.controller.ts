import { Controller, Post, Body } from '@nestjs/common';
import { IotService } from './iot.service';
import { IotGateway } from './iot.gateway';

@Controller('iot')
export class IotController {
  constructor(
    private readonly iotService: IotService,
    private readonly iotGateway: IotGateway,
  ) {}

  @Post('reading')
  async submitReading(@Body() body: { session_id: number; fsr_value: number; activation_percent: number }) {
    const reading = await this.iotService.saveReading(
      body.session_id,
      body.fsr_value,
      body.activation_percent
    );
    
    // Broadcast to doctor dashboard
    this.iotGateway.broadcastIotData(reading);
    
    return { success: true, reading };
  }
}
