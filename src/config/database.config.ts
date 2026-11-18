import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Configuración de TypeORM a partir de las variables de entorno (.env).
 * Se usa en AppModule con TypeOrmModule.forRootAsync para que
 * ConfigService ya esté disponible al momento de conectar.
 */
export const databaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: Number(config.get<string>('DB_PORT', '5432')),
  username: config.get<string>('DB_USERNAME'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_NAME'),
  // Registra automáticamente las entidades declaradas con TypeOrmModule.forFeature()
  autoLoadEntities: true,
  // Sincroniza el esquema con las entidades (solo recomendado en desarrollo)
  synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
});
