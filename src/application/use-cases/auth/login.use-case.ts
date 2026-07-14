// src/application/use-cases/auth/login.use-case.ts
import type { AuthRepository } from '../../../domain/ports/auth.repository';
import type { LoginDto } from '../../dtos/auth.dto';
import type { LoginResponse } from '../../../domain/entities/user.entity';

export class LoginUseCase {
  private authRepository: AuthRepository;
  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(dto: LoginDto): Promise<LoginResponse> {
    return this.authRepository.login(dto);
  }
}
