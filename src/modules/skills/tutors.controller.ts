import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { TutorProfile } from './interfaces/tutor-profile.interface';

/**
 * Perfil público del tutor: datos públicos, ofertas activas y rating.
 */
@Controller('tutors')
export class TutorsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly usersService: UsersService,
  ) {}

  // GET /api/v1/tutors/:id
  @Get(':id')
  async findProfile(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TutorProfile> {
    const tutor = await this.usersService.findById(id);
    if (!tutor || tutor.role !== UserRole.TUTOR || !tutor.isActive) {
      throw new NotFoundException(`Tutor con id ${id} no encontrado`);
    }

    const skills = await this.skillsService.findActiveByTutor(id);
    const reviewsCount = skills.reduce((sum, s) => sum + s.reviewsCount, 0);
    const ratingSum = skills.reduce(
      (sum, s) => sum + s.averageRating * s.reviewsCount,
      0,
    );

    return {
      id: tutor.id,
      fullName: tutor.fullName,
      bio: tutor.bio,
      memberSince: tutor.createdAt,
      averageRating:
        reviewsCount > 0
          ? Math.round((ratingSum / reviewsCount) * 100) / 100
          : 0,
      reviewsCount,
      skills,
    };
  }
}
