// src/application/use-cases/auth/register.use-case.ts
import type { AuthRepository } from '../../../domain/ports/auth.repository';
import type { RegisterPayload } from '../../dtos/auth.dto';

export class RegisterUseCase {
  private authRepository: AuthRepository;
  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(dto: RegisterPayload): Promise<void> {
    return this.authRepository.register(dto);
  }
}
