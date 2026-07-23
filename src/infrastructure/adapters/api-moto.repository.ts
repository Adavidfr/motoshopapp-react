// src/infrastructure/adapters/api-moto.repository.ts
import type { MotoRepository, ListMotosParams, PaginatedResult } from '../../domain/ports/moto.repository';
import type { Moto, MotoCreatePayload, MotoUpdatePayload } from '../../domain/entities/moto.entity';
import { normalizeMotoEstadoForApi } from '../../domain/entities/moto.entity';
import { httpClient } from '../http/axios-client';
import { resolveMediaUrl } from '../config/api.config';

interface ApiMarcaNested {
  id_marca: number;
  nombre: string;
  descripcion?: string | null;
  estado: boolean;
}

interface ApiCategoriaNested {
  id_categoria: number;
  nombre: string;
  descripcion?: string | null;
  estado: boolean;
}

interface ApiMoto {
  id_moto: number;
  modelo: string;
  anio: number;
  cilindraje: number;
  color: string;
  precio: string | number;
  stock: number;
  estado: string;
  imagen: string | null;
  fecha_registro: string;
  marca: ApiMarcaNested | string | number;
  categoria: ApiCategoriaNested | string | number;
}

function nestedName(value: ApiMarcaNested | ApiCategoriaNested | string | number): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return value.nombre;
}

function buildMotoFormData(payload: MotoCreatePayload | MotoUpdatePayload): FormData {
  const formData = new FormData();

  if (payload.modelo !== undefined) formData.append('modelo', payload.modelo);
  if (payload.anio !== undefined) formData.append('anio', String(payload.anio));
  if (payload.cilindraje !== undefined) formData.append('cilindraje', String(payload.cilindraje));
  if (payload.color !== undefined) formData.append('color', payload.color);
  if (payload.precio !== undefined) formData.append('precio', String(payload.precio));
  if (payload.stock !== undefined) formData.append('stock', String(payload.stock));
  if (payload.estado !== undefined) {
    formData.append('estado', normalizeMotoEstadoForApi(payload.estado));
  }
  if (payload.marca !== undefined) formData.append('marca', String(payload.marca));
  if (payload.categoria !== undefined) formData.append('categoria', String(payload.categoria));
  if (payload.imagen !== undefined) formData.append('imagen', payload.imagen);

  return formData;
}

export class ApiMotoRepository implements MotoRepository {
  private mapMoto(data: ApiMoto): Moto {
    return {
      idMoto: data.id_moto,
      modelo: data.modelo,
      anio: data.anio,
      cilindraje: data.cilindraje,
      color: data.color,
      precio: Number(data.precio),
      stock: data.stock,
      estado: data.estado,
      imagen: data.imagen ? resolveMediaUrl(data.imagen) : null,
      fechaRegistro: data.fecha_registro,
      categoria: nestedName(data.categoria),
      marca: nestedName(data.marca),
    };
  }

  async listMotos(params?: ListMotosParams): Promise<PaginatedResult<Moto>> {
    const response = await httpClient.get<{ count: number; next: string | null; previous: string | null; results: ApiMoto[] }>('/motos/', { params });
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: response.data.results.map((item) => this.mapMoto(item)),
    };
  }

  async getMoto(id: number): Promise<Moto> {
    const response = await httpClient.get<ApiMoto>(`/motos/${id}/`);
    return this.mapMoto(response.data);
  }

  async createMoto(payload: MotoCreatePayload): Promise<Moto> {
    const formData = buildMotoFormData(payload);
    const response = await httpClient.post<ApiMoto>('/motos/', formData);
    return this.mapMoto(response.data);
  }

  async updateMoto(id: number, payload: MotoUpdatePayload): Promise<Moto> {
    const formData = buildMotoFormData(payload);
    const response = await httpClient.patch<ApiMoto>(`/motos/${id}/`, formData);
    return this.mapMoto(response.data);
  }

  async deleteMoto(id: number): Promise<void> {
    await httpClient.delete(`/motos/${id}/`);
  }
}
