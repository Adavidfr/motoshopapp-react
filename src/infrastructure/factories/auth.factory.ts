// src/infrastructure/factories/auth.factory.ts
import { ApiAuthRepository } from '../adapters/api-auth.repository';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';

const authRepository = new ApiAuthRepository();

export const loginUseCase = new LoginUseCase(authRepository);
export const registerUseCase = new RegisterUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const authService = authRepository; // Para validación y refresco directo
