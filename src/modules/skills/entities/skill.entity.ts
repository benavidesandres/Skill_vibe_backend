import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { decimalTransformer } from '../../../common/transformers/decimal.transformer';
import { SkillCategory } from '../enums/skill-category.enum';
import { SkillLevel } from '../enums/skill-level.enum';

/**
 * Oferta de tutoría que publica un tutor en el marketplace.
 */
@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: SkillCategory })
  category!: SkillCategory;

  @Column({ type: 'enum', enum: SkillLevel })
  level!: SkillLevel;

  // Tecnología principal, ej. "React", "NestJS", "PostgreSQL"
  @Column({ length: 60 })
  technology!: string;

  @Column({
    name: 'price_per_hour',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  pricePerHour!: number;

  // false = pausada: no sale en el catálogo ni se puede reservar
  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  // Se recalculan cada vez que llega una reseña (ver ReviewsService)
  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  averageRating!: number;

  @Column({ name: 'reviews_count', type: 'int', default: 0 })
  reviewsCount!: number;

  @Column({ name: 'tutor_id' })
  tutorId!: string;

  // Si se borra la cuenta del tutor, se borran sus ofertas
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutor_id' })
  tutor!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
