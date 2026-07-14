// src/infrastructure/factories/profile.factory.ts
import { ApiProfileRepository } from '../adapters/api-profile.repository';
import { GetProfileUseCase } from '../../application/use-cases/profile/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/profile/update-profile.use-case';

const profileRepository = new ApiProfileRepository();

export const getProfileUseCase = new GetProfileUseCase(profileRepository);
export const updateProfileUseCase = new UpdateProfileUseCase(profileRepository);
