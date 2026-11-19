import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { QuerySkillsDto } from './dto/query-skills.dto';
import { PaginatedSkills } from './interfaces/paginated-skills.interface';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Ofertas de tutoría. Ver el catálogo es público;
 * publicar, editar y borrar es solo para tutores.
 */
@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // GET /api/v1/skills?search=react&category=frontend&minPrice=10&sort=price_asc&page=1
  @ApiOperation({ summary: 'Catálogo público con filtros, orden y paginación' })
  @Get()
  findCatalog(@Query() query: QuerySkillsDto): Promise<PaginatedSkills> {
    return this.skillsService.findCatalog(query);
  }

  // GET /api/v1/skills/mine  (va antes de :id para que "mine" no se lea como id)
  @ApiOperation({ summary: 'Mis ofertas (tutor), incluidas las pausadas' })
  @ApiBearerAuth()
  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TUTOR)
  findMine(@CurrentUser() tutor: User): Promise<Skill[]> {
    return this.skillsService.findMine(tutor);
  }

  // GET /api/v1/skills/:id
  @ApiOperation({ summary: 'Ver una oferta por id' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Skill> {
    return this.skillsService.findOne(id);
  }

  // POST /api/v1/skills
  @ApiOperation({ summary: 'Publicar oferta (tutor)' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TUTOR)
  create(
    @Body() dto: CreateSkillDto,
    @CurrentUser() tutor: User,
  ): Promise<Skill> {
    return this.skillsService.create(dto, tutor);
  }

  // PATCH /api/v1/skills/:id  -> solo el tutor dueño
  @ApiOperation({ summary: 'Editar / pausar mi oferta (tutor dueño)' })
  @ApiBearerAuth()
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TUTOR)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillDto,
    @CurrentUser() tutor: User,
  ): Promise<Skill> {
    return this.skillsService.update(id, dto, tutor);
  }

  // DELETE /api/v1/skills/:id  -> 204 No Content, solo el tutor dueño
  @ApiOperation({ summary: 'Borrar mi oferta sin reservas (tutor dueño)' })
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TUTOR)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() tutor: User,
  ): Promise<void> {
    return this.skillsService.remove(id, tutor);
  }
}
