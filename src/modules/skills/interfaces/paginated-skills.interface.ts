import { Skill } from '../entities/skill.entity';

export interface PaginatedSkills {
  data: Skill[];
  total: number;
  page: number;
  limit: number;
}
