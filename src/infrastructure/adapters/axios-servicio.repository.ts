import type {
  PaginatedServicios,
  Servicio,
  ServicioStats,
} from '../../domain/entities/servicio.entity';

import type {
  ServicioDto,
  ServicioFilters,
} from '../../application/dtos/servicio.dto';

import type {
  ServicioRepository,
} from '../../domain/ports/servicio.repository';
import { httpClient } from '../http/axios-client';



export class AxiosServicioRepository
  implements ServicioRepository
{
  async getAll(
    filters: ServicioFilters = {},
  ): Promise<PaginatedServicios> {
    const params: Record<string, string | number | boolean> = {};

    if (filters.page !== undefined) {
      params.page = filters.page;
    }

    if (filters.pageSize !== undefined) {
      params.page_size = filters.pageSize;
    }

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.estado !== undefined) {
      params.estado = filters.estado;
    }

    if (filters.nombre?.trim()) {
      params.nombre = filters.nombre.trim();
    }

    if (filters.descripcion?.trim()) {
      params.descripcion = filters.descripcion.trim();
    }

    if (filters.precio_base?.trim()) {
      params.precio_base = filters.precio_base.trim();
    }

    if (filters.ordering) {
      params.ordering = filters.ordering;
    }

    const response = await httpClient.get<PaginatedServicios>(
      '/servicios/',
      { params },
    );

    return response.data;
  }

  async getById(id: number): Promise<Servicio> {
    const response = await httpClient.get<Servicio>(
      `/servicios/${id}/`,
    );

    return response.data;
  }

  async getStats(): Promise<ServicioStats> {
    const response = await httpClient.get<ServicioStats>(
      '/servicios/stats/',
    );

    return response.data;
  }

  async create(dto: ServicioDto): Promise<Servicio> {
    const response = await httpClient.post<Servicio>(
      '/servicios/',
      this.preparePayload(dto),
    );

    return response.data;
  }

  async update(
    id: number,
    dto: Partial<ServicioDto>,
  ): Promise<Servicio> {
    const response = await httpClient.patch<Servicio>(
      `/servicios/${id}/`,
      this.preparePayload(dto),
    );

    return response.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/servicios/${id}/`);
  }

  private preparePayload(
    dto: Partial<ServicioDto>,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      ...dto,
    };

    if ('nombre' in dto && dto.nombre !== undefined) {
      payload.nombre = dto.nombre.trim();
    }

    if (
      'descripcion' in dto &&
      dto.descripcion !== undefined
    ) {
      payload.descripcion =
        dto.descripcion?.trim() || null;
    }

    if (
      'precio_base' in dto &&
      dto.precio_base !== undefined
    ) {
      payload.precio_base = dto.precio_base.trim();
    }

    return payload;
  }
}