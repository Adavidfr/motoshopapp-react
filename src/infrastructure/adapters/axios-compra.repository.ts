import type {
  Compra,
  CompraStats,
  PaginatedCompras,
} from '../../domain/entities/compra.entity';

import type {
  CompraDto,
  CompraFilters,
} from '../../application/dtos/compra.dto';

import type { CompraRepository } from '../../domain/ports/compra.repository';
import { httpClient } from '../http/axios-client';

interface ApiCompra {
  id_compra: number;
  proveedor: number;
  moto: number | null;
  repuesto: number | null;
  cantidad: number;
  precio_unitario: string | number;
  subtotal: string | number;
  fecha_compra: string;
  estado: Compra['estado'];
  stock_aplicado?: boolean;
}

function mapCompra(data: ApiCompra): Compra {
  return {
    id_compra: data.id_compra,
    proveedor: data.proveedor,
    moto: data.moto,
    repuesto: data.repuesto,
    cantidad: data.cantidad,
    precio_unitario: String(data.precio_unitario),
    subtotal: String(data.subtotal),
    fecha_compra: data.fecha_compra,
    estado: data.estado,
    stock_aplicado: Boolean(data.stock_aplicado),
  };
}

export class AxiosCompraRepository implements CompraRepository {
  async getAll(filters: CompraFilters = {}): Promise<PaginatedCompras> {
    const params: Record<string, string | number | boolean> = {};

    if (filters.page !== undefined) params.page = filters.page;
    if (filters.pageSize !== undefined) params.page_size = filters.pageSize;
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.proveedor !== undefined) params.proveedor = filters.proveedor;
    if (filters.moto !== undefined) params.moto = filters.moto;
    if (filters.repuesto !== undefined) params.repuesto = filters.repuesto;
    if (filters.estado) params.estado = filters.estado;
    if (filters.fechaCompraAfter) params.fecha_compra_after = filters.fechaCompraAfter;
    if (filters.fechaCompraBefore) params.fecha_compra_before = filters.fechaCompraBefore;
    if (filters.ordering) params.ordering = filters.ordering;

    const response = await httpClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: ApiCompra[];
    }>('/compras/', { params });

    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: (response.data.results || []).map(mapCompra),
    };
  }

  async getById(id: number): Promise<Compra> {
    const response = await httpClient.get<ApiCompra>(`/compras/${id}/`);
    return mapCompra(response.data);
  }

  async getStats(): Promise<CompraStats> {
    const response = await httpClient.get<CompraStats>('/compras/stats/');
    return response.data;
  }

  async create(dto: CompraDto): Promise<Compra> {
    const response = await httpClient.post<ApiCompra>(
      '/compras/',
      this.preparePayload(dto),
    );
    return mapCompra(response.data);
  }

  async update(id: number, dto: Partial<CompraDto>): Promise<Compra> {
    const response = await httpClient.patch<ApiCompra>(
      `/compras/${id}/`,
      this.preparePayload(dto),
    );
    return mapCompra(response.data);
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/compras/${id}/`);
  }

  async recibir(id: number): Promise<Compra> {
    const response = await httpClient.post<ApiCompra>(`/compras/${id}/recibir/`);
    return mapCompra(response.data);
  }

  private preparePayload(dto: Partial<CompraDto>): Record<string, unknown> {
    const payload: Record<string, unknown> = { ...dto };

    if ('moto' in dto) payload.moto = dto.moto ?? null;
    if ('repuesto' in dto) payload.repuesto = dto.repuesto ?? null;
    if ('precio_unitario' in dto && dto.precio_unitario !== undefined) {
      payload.precio_unitario = dto.precio_unitario.trim();
    }
    if ('subtotal' in dto && dto.subtotal !== undefined) {
      payload.subtotal = dto.subtotal.trim();
    }

    return payload;
  }
}
