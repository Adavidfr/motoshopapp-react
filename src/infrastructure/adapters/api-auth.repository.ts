// src/infrastructure/adapters/api-auth.repository.ts
import type { AuthRepository } from '../../domain/ports/auth.repository';
import type { User, LoginResponse } from '../../domain/entities/user.entity';
import type { LoginDto, RegisterDto } from '../../application/dtos/auth.dto';
import { httpClient } from '../http/axios-client';

export class ApiAuthRepository implements AuthRepository {
  private mapUser(data: any): User {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      isStaff: data.is_staff,
      isActive: data.is_active,
      dateJoined: data.date_joined,
      role: data.role,
      numOrders: data.num_orders ? Number(data.num_orders) : 0,
    };
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const response = await httpClient.post('/auth/login/', {
      username: dto.username,
      password: dto.password,
    });
    
    // El backend devuelve tokens y detalles del usuario
    const { access, refresh, user } = response.data;
    return {
      tokens: { access, refresh },
      user: this.mapUser(user),
    };
  }

  async register(dto: RegisterDto): Promise<void> {
    await httpClient.post('/auth/register/', {
      username: dto.username,
      email: dto.email,
      password: dto.password,
      first_name: dto.firstName,
      last_name: dto.lastName,
    });
  }

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout/');
  }

  async refreshToken(refresh: string): Promise<string> {
    const response = await httpClient.post('/auth/token/refresh/', { refresh });
    return response.data.access;
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await httpClient.post('/auth/token/verify/', { token });
      return true;
    } catch {
      return false;
    }
  }
}
