import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SkillsModule } from './modules/skills/skills.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';

@Module({
  imports: [
    // Carga el archivo .env y deja ConfigService disponible en toda la app
    ConfigModule.forRoot({ isGlobal: true }),
    // Conexión a PostgreSQL usando la configuración de src/config/database.config.ts
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    AuthModule,
    UsersModule,
    SkillsModule,
    RecommendationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
