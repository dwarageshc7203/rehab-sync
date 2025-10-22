import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class IotGateway {
  @WebSocketServer()
  server: Server;

  broadcastIotData(reading: any) {
    this.server.emit('iot:data', reading);
  }
}
