import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { Booking } from '../../bookings/entities/booking.entity';

/**
 * Reseña que deja un estudiante después de una reserva completada.
 * Hay como máximo una reseña por reserva (booking_id es único).
 */
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'booking_id', unique: true })
  bookingId!: string;

  @OneToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @Column({ name: 'skill_id' })
  skillId!: string;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill!: Skill;

  @Column({ name: 'student_id' })
  studentId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
