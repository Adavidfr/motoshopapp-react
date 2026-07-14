// src/domain/ports/profile.repository.ts
import type { ClientePerfil } from '../entities/profile.entity';
import type { UpdateProfileDto } from '../../application/dtos/profile.dto';

export interface ProfileRepository {
  getProfile(): Promise<ClientePerfil>;
  updateProfile(dto: UpdateProfileDto): Promise<ClientePerfil>;
}
