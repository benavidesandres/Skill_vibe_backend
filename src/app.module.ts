import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SkillsModule } from './modules/skills/skills.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';

@Module({
  imports: [AuthModule, UsersModule, SkillsModule, RecommendationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
