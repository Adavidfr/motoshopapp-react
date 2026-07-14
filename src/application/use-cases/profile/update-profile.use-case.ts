// src/application/use-cases/profile/update-profile.use-case.ts
import type { ProfileRepository } from '../../../domain/ports/profile.repository';
import type { ClientePerfil } from '../../../domain/entities/profile.entity';
import type { UpdateProfileDto } from '../../dtos/profile.dto';

export class UpdateProfileUseCase {
  private profileRepository: ProfileRepository;
  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(dto: UpdateProfileDto): Promise<ClientePerfil> {
    return this.profileRepository.updateProfile(dto);
  }
}
