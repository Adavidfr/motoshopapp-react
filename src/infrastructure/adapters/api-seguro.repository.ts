// src/infrastructure/adapters/api-seguro.repository.ts
import type { SeguroRepository, SeguroFilters } from '../../domain/ports/seguro.repository';
import type { Seguro, PaginatedSeguros } from '../../domain/entities/seguro.entity';
import { httpClient } from '../http/axios-client';

export class ApiSeguroRepository implements SeguroRepository {
  private map(data: any): Seguro {
    return {
      id_seguro:      data.id_seguro,
      id_venta:       data.id_venta,
      aseguradora:    data.aseguradora,
      numero_poliza:  data.numero_poliza,
      tipo_cobertura: data.tipo_cobertura,
      fecha_inicio:   data.fecha_inicio,
      fecha_fin:      data.fecha_fin,
      costo_anual:    Number(data.costo_anual),
      estado:         data.estado,
    };
  }

  async listSeguros(filters?: SeguroFilters): Promise<PaginatedSeguros> {
    const params: any = {};
    if (filters) {
      if (filters.page)     params.page      = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.estado)   params.estado    = filters.estado;
      if (filters.id_venta) params.id_venta  = filters.id_venta;
      if (filters.search)   params.search    = filters.search;
    }
    const res = await httpClient.get('/seguros/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i: any) => this.map(i)),
    };
  }

  async getSeguro(id: number): Promise<Seguro> {
    const res = await httpClient.get(`/seguros/${id}/`);
    return this.map(res.data);
  }

  async createSeguro(payload: Omit<Seguro, 'id_seguro'>): Promise<Seguro> {
    const res = await httpClient.post('/seguros/', payload);
    return this.map(res.data);
  }

  async updateSeguro(id: number, payload: Partial<Seguro>): Promise<Seguro> {
    const res = await httpClient.patch(`/seguros/${id}/`, payload);
    return this.map(res.data);
  }

  async deleteSeguro(id: number): Promise<void> {
    await httpClient.delete(`/seguros/${id}/`);
  }
}
