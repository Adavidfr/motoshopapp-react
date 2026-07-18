import type {
  PaginatedProveedores,
  Proveedor,
  ProveedorStats,
} from '../../domain/entities/proveedor.entity';

import type {
  ProveedorDto,
  ProveedorFilters,
} from '../../application/dtos/proveedor.dto';

import type { ProveedorRepository } from '../../domain/ports/proveedor.repository';
import { httpClient } from '../http/axios-client';

export class AxiosProveedorRepository implements ProveedorRepository {
  async getAll(
    filters: ProveedorFilters = {},
  ): Promise<PaginatedProveedores> {
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

    if (filters.contacto?.trim()) {
      params.contacto = filters.contacto.trim();
    }

    if (filters.correo?.trim()) {
      params.correo = filters.correo.trim();
    }

    if (filters.ordering) {
      params.ordering = filters.ordering;
    }

    const response = await httpClient.get<PaginatedProveedores>(
      '/proveedores/',
      { params },
    );

    return response.data;
  }

  async getById(id: number): Promise<Proveedor> {
    const response = await httpClient.get<Proveedor>(
      `/proveedores/${id}/`,
    );

    return response.data;
  }

  async getStats(): Promise<ProveedorStats> {
    const response = await httpClient.get<ProveedorStats>(
      '/proveedores/stats/',
    );

    return response.data;
  }

  async create(dto: ProveedorDto): Promise<Proveedor> {
    const response = await httpClient.post<Proveedor>(
      '/proveedores/',
      dto,
    );

    return response.data;
  }

  async update(
    id: number,
    dto: Partial<ProveedorDto>,
  ): Promise<Proveedor> {
    const response = await httpClient.patch<Proveedor>(
      `/proveedores/${id}/`,
      dto,
    );

    return response.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/proveedores/${id}/`);
  }
}