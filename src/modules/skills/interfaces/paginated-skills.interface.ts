import { Skill } from '../entities/skill.entity';

export class PaginatedSkills {
  data!: Skill[];
  total!: number;
  page!: number;
  limit!: number;
}
