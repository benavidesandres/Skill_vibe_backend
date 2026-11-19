import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { decimalTransformer } from '../../../common/transformers/decimal.transformer';
import { BookingStatus } from '../enums/booking-status.enum';

/**
 * Reserva que hace un estudiante sobre una oferta de un tutor.
 */
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt!: Date;

  @Column({ type: 'int' })
  hours!: number;

  // Se calcula al reservar (precio por hora x horas) para que no cambie
  // si el tutor modifica el precio de la oferta después
  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  totalPrice!: number;

  @Column({ type: 'text', nullable: true })
  message!: string | null;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status!: BookingStatus;

  // Enlace de la videollamada. Se genera cuando el tutor confirma la reserva.
  // En la respuesta solo sale mientras la reserva está confirmada; en el resto
  // de estados se envía null (el valor guardado en la base no cambia)
  @Transform(({ value, obj }) =>
    obj.status === BookingStatus.CONFIRMED ? value : null,
  )
  @Column({ name: 'meeting_link', type: 'varchar', nullable: true })
  meetingLink!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
