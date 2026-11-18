import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSkillDto } from './create-skill.dto';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {
  // Permite pausar (false) o volver a publicar (true) la oferta
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
