import { Skill } from '../entities/skill.entity';

/** Perfil público del tutor (GET /tutors/:id) */
export class TutorProfile {
  id!: string;
  fullName!: string;
  bio!: string | null;
  memberSince!: Date;
  /** Promedio de todas sus ofertas, ponderado por número de reseñas */
  averageRating!: number;
  reviewsCount!: number;
  skills!: Skill[];
}
