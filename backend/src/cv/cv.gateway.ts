import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class CvGateway {
  @WebSocketServer()
  server: Server;

  broadcastCvAnalysis(analysis: any) {
    this.server.emit('cv:analysis', analysis);
  }
}
