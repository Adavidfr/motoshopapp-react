// src/infrastructure/adapters/api-profile.repository.ts
import type { ProfileRepository } from '../../domain/ports/profile.repository';
import type { ClientePerfil } from '../../domain/entities/profile.entity';
import type { UpdateProfileDto } from '../../application/dtos/profile.dto';
import { httpClient } from '../http/axios-client';

export class ApiProfileRepository implements ProfileRepository {
  private mapProfile(data: any): ClientePerfil {
    return {
      idPerfil: data.id_perfil,
      username: data.username,
      email: data.email,
      cedula: data.cedula || '',
      telefono: data.telefono || '',
      direccion: data.direccion || '',
      fotoPerfil: data.foto_perfil || null,
      fechaNacimiento: data.fecha_nacimiento || null,
    };
  }

  async getProfile(): Promise<ClientePerfil> {
    const response = await httpClient.get('/clientes/perfil/');
    return this.mapProfile(response.data);
  }

  async updateProfile(dto: UpdateProfileDto): Promise<ClientePerfil> {
    const response = await httpClient.patch('/clientes/perfil/', {
      cedula: dto.cedula,
      telefono: dto.telefono,
      direccion: dto.direccion,
      fecha_nacimiento: dto.fechaNacimiento,
      foto_perfil: dto.fotoPerfil,
    });
    return this.mapProfile(response.data);
  }
}
