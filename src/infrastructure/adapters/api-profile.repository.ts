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
    const hasFile = dto.fotoPerfil instanceof File;
    const payload: any = hasFile ? new FormData() : {};

    const appendData = (key: string, value: any) => {
      if (value !== undefined && value !== null) {
        if (hasFile) {
          (payload as FormData).append(key, value);
        } else {
          payload[key] = value;
        }
      }
    };

    appendData('cedula', dto.cedula);
    appendData('telefono', dto.telefono);
    appendData('direccion', dto.direccion);
    if (dto.fechaNacimiento) {
      appendData('fecha_nacimiento', dto.fechaNacimiento);
    }
    
    // Si fotoPerfil es un archivo, lo subimos. Si es un string (URL), lo omitimos porque no ha cambiado.
    if (hasFile) {
      appendData('foto_perfil', dto.fotoPerfil);
    }
    
    const headers = hasFile ? { 'Content-Type': 'multipart/form-data' } : {};

    try {
      const response = await httpClient.patch('/clientes/perfil/', payload, { headers });
      return this.mapProfile(response.data);
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.data?.detail?.includes('no encontrado')) {
        const response = await httpClient.post('/clientes/perfil/', payload, { headers });
        return this.mapProfile(response.data);
      }
      throw err;
    }
  }
}
