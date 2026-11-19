/**
 * Contrato para crear salas de videollamada (patrón Strategy).
 * Se usa como token de inyección: BookingsService depende de esta clase
 * y no de una implementación concreta, así se puede cambiar por Jitsi,
 * Zoom o WebRTC sin tocar las reservas.
 */
export abstract class VideoRoomProvider {
  /**
   * Devuelve el enlace de la sala para una sesión.
   * @param sessionId id de la sesión (la reserva), útil para registrar o asociar la sala
   */
  abstract generateMeetingLink(sessionId: string): string;
}
