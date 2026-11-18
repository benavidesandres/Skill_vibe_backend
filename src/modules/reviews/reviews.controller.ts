import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Sin prefijo propio porque tiene una ruta bajo /reviews y otra bajo /skills.
 */
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // POST /api/v1/reviews  -> solo el estudiante de una reserva completada
  @Post('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  create(
    @Body() dto: CreateReviewDto,
    @CurrentUser() student: User,
  ): Promise<Review> {
    return this.reviewsService.create(dto, student);
  }

  // GET /api/v1/skills/:skillId/reviews  -> público
  @Get('skills/:skillId/reviews')
  findBySkill(
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ): Promise<Review[]> {
    return this.reviewsService.findBySkill(skillId);
  }
}
