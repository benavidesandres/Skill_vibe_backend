import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name', length: 100 })
  fullName!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  // Se guarda el hash (bcrypt), nunca la contraseña en texto plano.
  // @Exclude evita que se envíe en las respuestas JSON.
  @ApiHideProperty()
  @Exclude()
  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role!: UserRole;

  // Presentación corta que se muestra en el perfil público del tutor
  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
