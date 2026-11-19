import { Module } from '@nestjs/common';
import { VideoRoomProvider } from './video-room.provider';
import { SimulatedVideoRoomProvider } from './simulated-video-room.provider';

@Module({
  providers: [
    // Para usar Jitsi, Zoom o WebRTC, cambia solo esta clase
    { provide: VideoRoomProvider, useClass: SimulatedVideoRoomProvider },
  ],
  exports: [VideoRoomProvider],
})
export class VideoModule {}
