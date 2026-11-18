import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { TutorsController } from './tutors.controller';
import { Skill } from './entities/skill.entity';
import { UsersModule } from '../users/users.module';

@Module({
  // UsersModule se importa para que TutorsController pueda buscar al tutor
  imports: [TypeOrmModule.forFeature([Skill]), UsersModule],
  controllers: [SkillsController, TutorsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
