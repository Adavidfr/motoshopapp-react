// src/infrastructure/adapters/api-garantia.repository.ts
import type { GarantiaRepository, GarantiaFilters } from '../../domain/ports/garantia.repository';
import type { Garantia, PaginatedGarantias } from '../../domain/entities/garantia.entity';
import { httpClient } from '../http/axios-client';

export class ApiGarantiaRepository implements GarantiaRepository {
  private map(data: any): Garantia {
    return {
      id_garantia:    data.id_garantia,
      id_venta:       data.id_venta,
      id_moto:        data.id_moto,
      meses_garantia: Number(data.meses_garantia),
      fecha_inicio:   data.fecha_inicio,
      fecha_fin:      data.fecha_fin,
      descripcion:    data.descripcion ?? '',
      estado:         data.estado,
    };
  }

  async listGarantias(filters?: GarantiaFilters): Promise<PaginatedGarantias> {
    const params: any = {};
    if (filters) {
      if (filters.page)     params.page      = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.estado)   params.estado    = filters.estado;
      if (filters.id_venta) params.id_venta  = filters.id_venta;
      if (filters.search)   params.search    = filters.search;
    }
    const res = await httpClient.get('/garantias/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i: any) => this.map(i)),
    };
  }

  async getGarantia(id: number): Promise<Garantia> {
    const res = await httpClient.get(`/garantias/${id}/`);
    return this.map(res.data);
  }

  async createGarantia(payload: Omit<Garantia, 'id_garantia'>): Promise<Garantia> {
    const res = await httpClient.post('/garantias/', payload);
    return this.map(res.data);
  }

  async updateGarantia(id: number, payload: Partial<Garantia>): Promise<Garantia> {
    const res = await httpClient.patch(`/garantias/${id}/`, payload);
    return this.map(res.data);
  }

  async deleteGarantia(id: number): Promise<void> {
    await httpClient.delete(`/garantias/${id}/`);
  }
}
