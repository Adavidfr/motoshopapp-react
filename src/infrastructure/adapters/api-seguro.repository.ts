// src/infrastructure/adapters/api-seguro.repository.ts
import type { SeguroRepository, SeguroFilters } from '../../domain/ports/seguro.repository';
import type {
  Seguro,
  PaginatedSeguros,
  SeguroCreatePayload,
  SeguroUpdatePayload,
  SeguroEstado,
} from '../../domain/entities/seguro.entity';
import { httpClient } from '../http/axios-client';

interface ApiSeguro {
  id_seguro: number;
  id_venta: number;
  aseguradora: string;
  numero_poliza: string;
  tipo_cobertura: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo_anual: string | number;
  estado: SeguroEstado;
}

interface ApiPaginatedSeguros {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiSeguro[];
}

export class ApiSeguroRepository implements SeguroRepository {
  private map(data: ApiSeguro): Seguro {
    return {
      id_seguro: data.id_seguro,
      id_venta: data.id_venta,
      aseguradora: data.aseguradora,
      numero_poliza: data.numero_poliza,
      tipo_cobertura: data.tipo_cobertura,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      costo_anual: Number(data.costo_anual),
      estado: data.estado,
    };
  }

  async listSeguros(filters?: SeguroFilters): Promise<PaginatedSeguros> {
    const params: Record<string, string | number> = {};
    if (filters) {
      if (filters.page !== undefined) params.page = filters.page;
      if (filters.pageSize !== undefined) params.page_size = filters.pageSize;
      if (filters.estado) params.estado = filters.estado;
      if (filters.id_venta !== undefined) params.id_venta = filters.id_venta;
      if (filters.search) params.search = filters.search;
    }
    const res = await httpClient.get<ApiPaginatedSeguros>('/seguros/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((item) => this.map(item)),
    };
  }

  async getSeguro(id: number): Promise<Seguro> {
    const res = await httpClient.get<ApiSeguro>(`/seguros/${id}/`);
    return this.map(res.data);
  }

  async createSeguro(payload: SeguroCreatePayload): Promise<Seguro> {
    const res = await httpClient.post<ApiSeguro>('/seguros/', {
      id_venta: payload.id_venta,
      aseguradora: payload.aseguradora,
      tipo_cobertura: payload.tipo_cobertura,
      fecha_inicio: payload.fecha_inicio,
      fecha_fin: payload.fecha_fin,
      costo_anual: payload.costo_anual,
      ...(payload.estado !== undefined ? { estado: payload.estado } : {}),
    });
    return this.map(res.data);
  }

  async updateSeguro(id: number, payload: SeguroUpdatePayload): Promise<Seguro> {
    const body: Record<string, string | number> = {};
    if (payload.id_venta !== undefined) body.id_venta = payload.id_venta;
    if (payload.aseguradora !== undefined) body.aseguradora = payload.aseguradora;
    if (payload.tipo_cobertura !== undefined) body.tipo_cobertura = payload.tipo_cobertura;
    if (payload.fecha_inicio !== undefined) body.fecha_inicio = payload.fecha_inicio;
    if (payload.fecha_fin !== undefined) body.fecha_fin = payload.fecha_fin;
    if (payload.costo_anual !== undefined) body.costo_anual = payload.costo_anual;
    if (payload.estado !== undefined) body.estado = payload.estado;

    const res = await httpClient.patch<ApiSeguro>(`/seguros/${id}/`, body);
    return this.map(res.data);
  }

  async deleteSeguro(id: number): Promise<void> {
    await httpClient.delete(`/seguros/${id}/`);
  }
}
