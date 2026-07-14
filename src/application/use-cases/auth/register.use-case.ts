// src/application/use-cases/auth/register.use-case.ts
import type { AuthRepository } from '../../../domain/ports/auth.repository';
import type { RegisterDto } from '../../dtos/auth.dto';

export class RegisterUseCase {
  private authRepository: AuthRepository;
  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(dto: RegisterDto): Promise<void> {
    return this.authRepository.register(dto);
  }
}
