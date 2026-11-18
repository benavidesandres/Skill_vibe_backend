/**
 * Estados de una reserva.
 * pending -> confirmed | rejected (tutor)
 * confirmed -> completed (tutor)
 * pending | confirmed -> cancelled (estudiante)
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}
