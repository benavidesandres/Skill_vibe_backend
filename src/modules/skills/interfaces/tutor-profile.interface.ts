import { Skill } from '../entities/skill.entity';

export interface TutorProfile {
  id: string;
  fullName: string;
  bio: string | null;
  memberSince: Date;
  // Promedio de todas sus ofertas, ponderado por número de reseñas
  averageRating: number;
  reviewsCount: number;
  skills: Skill[];
}
