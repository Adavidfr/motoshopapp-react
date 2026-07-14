// src/application/use-cases/profile/get-profile.use-case.ts
import type { ProfileRepository } from '../../../domain/ports/profile.repository';
import type { ClientePerfil } from '../../../domain/entities/profile.entity';

export class GetProfileUseCase {
  private profileRepository: ProfileRepository;
  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  async execute(): Promise<ClientePerfil> {
    return this.profileRepository.getProfile();
  }
}
