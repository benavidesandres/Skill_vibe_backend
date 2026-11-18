import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  // forFeature registra el repositorio de User para poder inyectarlo en el servicio
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  // Se exporta para que AuthModule pueda usarlo (registro y login)
  exports: [UsersService],
})
export class UsersModule {}
