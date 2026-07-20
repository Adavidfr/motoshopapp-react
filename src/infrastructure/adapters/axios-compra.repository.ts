import type {
  Compra,
  CompraStats,
  PaginatedCompras,
} from '../../domain/entities/compra.entity';

import type {
  CompraDto,
  CompraFilters,
} from '../../application/dtos/compra.dto';

import type {
  CompraRepository,
} from '../../domain/ports/compra.repository';
import { httpClient } from '../http/axios-client';


export class AxiosCompraRepository
  implements CompraRepository
{
  async getAll(
    filters: CompraFilters = {},
  ): Promise<PaginatedCompras> {
    const params: Record<
      string,
      string | number | boolean
    > = {};

    if (filters.page !== undefined) {
      params.page = filters.page;
    }

    if (filters.pageSize !== undefined) {
      params.page_size = filters.pageSize;
    }

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.proveedor !== undefined) {
      params.proveedor = filters.proveedor;
    }

    if (filters.moto !== undefined) {
      params.moto = filters.moto;
    }

    if (filters.repuesto !== undefined) {
      params.repuesto = filters.repuesto;
    }

    if (filters.estado) {
      params.estado = filters.estado;
    }

    if (filters.fechaCompraAfter) {
      params.fecha_compra_after =
        filters.fechaCompraAfter;
    }

    if (filters.fechaCompraBefore) {
      params.fecha_compra_before =
        filters.fechaCompraBefore;
    }

    if (filters.ordering) {
      params.ordering = filters.ordering;
    }

    const response =
      await httpClient.get<PaginatedCompras>(
        '/compras/',
        { params },
      );

    return response.data;
  }

  async getById(id: number): Promise<Compra> {
    const response = await httpClient.get<Compra>(
      `/compras/${id}/`,
    );

    return response.data;
  }

  async getStats(): Promise<CompraStats> {
    const response =
      await httpClient.get<CompraStats>(
        '/compras/stats/',
      );

    return response.data;
  }

  async create(dto: CompraDto): Promise<Compra> {
    const response = await httpClient.post<Compra>(
      '/compras/',
      this.preparePayload(dto),
    );

    return response.data;
  }

  async update(
    id: number,
    dto: Partial<CompraDto>,
  ): Promise<Compra> {
    const response = await httpClient.patch<Compra>(
      `/compras/${id}/`,
      this.preparePayload(dto),
    );

    return response.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/compras/${id}/`);
  }

  private preparePayload(
    dto: Partial<CompraDto>,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      ...dto,
    };

    if ('moto' in dto) {
      payload.moto = dto.moto ?? null;
    }

    if ('repuesto' in dto) {
      payload.repuesto = dto.repuesto ?? null;
    }

    if (
      'precio_unitario' in dto &&
      dto.precio_unitario !== undefined
    ) {
      payload.precio_unitario =
        dto.precio_unitario.trim();
    }

    if (
      'subtotal' in dto &&
      dto.subtotal !== undefined
    ) {
      payload.subtotal = dto.subtotal.trim();
    }

    return payload;
  }
}