import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { QuerySkillsDto } from './dto/query-skills.dto';
import { SkillSort } from './enums/skill-sort.enum';
import { PaginatedSkills } from './interfaces/paginated-skills.interface';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  create(dto: CreateSkillDto, tutor: User): Promise<Skill> {
    const skill = this.skillsRepository.create({ ...dto, tutorId: tutor.id });
    return this.skillsRepository.save(skill);
  }

  /**
   * Catálogo público: solo ofertas activas, con filtros, orden y paginación.
   */
  async findCatalog(query: QuerySkillsDto): Promise<PaginatedSkills> {
    const { page, limit } = query;
    const qb = this.withPublicTutor(
      this.skillsRepository.createQueryBuilder('skill'),
    ).where('skill.isActive = true');

    if (query.search) {
      qb.andWhere(
        '(skill.title ILIKE :search OR skill.description ILIKE :search OR skill.technology ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.category) {
      qb.andWhere('skill.category = :category', { category: query.category });
    }
    if (query.level) {
      qb.andWhere('skill.level = :level', { level: query.level });
    }
    if (query.technology) {
      qb.andWhere('skill.technology ILIKE :technology', {
        technology: query.technology,
      });
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('skill.pricePerHour >= :minPrice', {
        minPrice: query.minPrice,
      });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('skill.pricePerHour <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }
    if (query.tutorId) {
      qb.andWhere('skill.tutorId = :tutorId', { tutorId: query.tutorId });
    }

    switch (query.sort) {
      case SkillSort.PRICE_ASC:
        qb.orderBy('skill.pricePerHour', 'ASC');
        break;
      case SkillSort.PRICE_DESC:
        qb.orderBy('skill.pricePerHour', 'DESC');
        break;
      case SkillSort.RATING:
        qb.orderBy('skill.averageRating', 'DESC').addOrderBy(
          'skill.reviewsCount',
          'DESC',
        );
        break;
      default:
        qb.orderBy('skill.createdAt', 'DESC');
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  // Todas las ofertas del tutor autenticado, también las pausadas
  findMine(tutor: User): Promise<Skill[]> {
    return this.skillsRepository.find({
      where: { tutorId: tutor.id },
      order: { createdAt: 'DESC' },
    });
  }

  // Ofertas activas de un tutor, para su perfil público
  findActiveByTutor(tutorId: string): Promise<Skill[]> {
    return this.skillsRepository.find({
      where: { tutorId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.withPublicTutor(
      this.skillsRepository.createQueryBuilder('skill'),
    )
      .where('skill.id = :id', { id })
      .getOne();
    if (!skill) {
      throw new NotFoundException(`Oferta con id ${id} no encontrada`);
    }
    return skill;
  }

  async update(id: string, dto: UpdateSkillDto, tutor: User): Promise<Skill> {
    const skill = await this.findOwned(id, tutor);
    this.skillsRepository.merge(skill, dto);
    return this.skillsRepository.save(skill);
  }

  async remove(id: string, tutor: User): Promise<void> {
    const skill = await this.findOwned(id, tutor);

    // Borrarla se llevaría las reservas y reseñas de los estudiantes (CASCADE)
    const hasBookings = await this.skillsRepository.manager.exists(Booking, {
      where: { skillId: skill.id },
    });
    if (hasBookings) {
      throw new ConflictException(
        'La oferta tiene reservas; páusala con isActive: false',
      );
    }

    await this.skillsRepository.remove(skill);
  }

  private async findOwned(id: string, tutor: User): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({ where: { id } });
    if (!skill) {
      throw new NotFoundException(`Oferta con id ${id} no encontrada`);
    }
    if (skill.tutorId !== tutor.id) {
      throw new ForbiddenException('Solo puedes modificar tus propias ofertas');
    }
    return skill;
  }

  // Une al tutor trayendo solo sus datos públicos (sin email ni password)
  private withPublicTutor(
    qb: SelectQueryBuilder<Skill>,
  ): SelectQueryBuilder<Skill> {
    return qb
      .leftJoin('skill.tutor', 'tutor')
      .addSelect(['tutor.id', 'tutor.fullName', 'tutor.bio']);
  }
}
