import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VideoRoomProvider } from './video-room.provider';

const DEFAULT_BASE_URL = 'http://localhost:3000';

/**
 * Sala simulada: apunta a public/sala.html de esta misma API.
 * No usa ningún servicio externo de video.
 */
@Injectable()
export class SimulatedVideoRoomProvider extends VideoRoomProvider {
  private readonly logger = new Logger(SimulatedVideoRoomProvider.name);

  constructor(private readonly configService: ConfigService) {
    super();
  }

  generateMeetingLink(sessionId: string): string {
    const baseUrl = (
      this.configService.get<string>('VIDEO_BASE_URL') || DEFAULT_BASE_URL
    ).replace(/\/+$/, '');

    // El código de sala es un UUID nuevo, no el id de la reserva:
    // el id de la sesión solo aparece en el log
    const room = randomUUID().replace(/-/g, '');
    this.logger.log(`Sala ${room} creada para la sesión ${sessionId}`);

    return `${baseUrl}/sala.html?room=${room}`;
  }
}
