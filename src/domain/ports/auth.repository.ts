// src/domain/ports/auth.repository.ts
import type { LoginResponse } from '../entities/user.entity';
import type { LoginDto, RegisterDto } from '../../application/dtos/auth.dto';

export interface AuthRepository {
  login(dto: LoginDto): Promise<LoginResponse>;
  register(dto: RegisterDto): Promise<void>;
  logout(): Promise<void>;
  refreshToken(refresh: string): Promise<string>;
  verifyToken(token: string): Promise<boolean>;
}
