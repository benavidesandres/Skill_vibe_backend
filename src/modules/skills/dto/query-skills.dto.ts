import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SkillCategory } from '../enums/skill-category.enum';
import { SkillLevel } from '../enums/skill-level.enum';
import { SkillSort } from '../enums/skill-sort.enum';

/**
 * Filtros del catálogo (query string de GET /skills).
 * Los números llegan como texto y los convierte enableImplicitConversion (main.ts).
 */
export class QuerySkillsDto {
  // Busca en título, descripción y tecnología
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(SkillCategory)
  category?: SkillCategory;

  @IsOptional()
  @IsEnum(SkillLevel)
  level?: SkillLevel;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  technology?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsUUID()
  tutorId?: string;

  @IsOptional()
  @IsEnum(SkillSort)
  sort: SkillSort = SkillSort.RECENT;

  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
