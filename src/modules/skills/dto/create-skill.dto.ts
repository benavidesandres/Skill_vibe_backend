import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SkillCategory } from '../enums/skill-category.enum';
import { SkillLevel } from '../enums/skill-level.enum';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(120)
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(2000)
  description!: string;

  @IsEnum(SkillCategory, {
    message: `La categoría debe ser una de: ${Object.values(SkillCategory).join(', ')}`,
  })
  category!: SkillCategory;

  @IsEnum(SkillLevel, {
    message: `El nivel debe ser uno de: ${Object.values(SkillLevel).join(', ')}`,
  })
  level!: SkillLevel;

  @IsString()
  @IsNotEmpty({ message: 'La tecnología es obligatoria' })
  @MaxLength(60)
  technology!: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número' })
  @Min(0)
  @Max(99999999)
  pricePerHour!: number;
}
