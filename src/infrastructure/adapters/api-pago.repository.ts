// src/infrastructure/adapters/api-pago.repository.ts
import type { PagoRepository, PagoFilters } from '../../domain/ports/pago.repository';
import type { Pago, PagoStats, PaginatedPagos } from '../../domain/entities/pago.entity';
import { httpClient } from '../http/axios-client';

export class ApiPagoRepository implements PagoRepository {
  private mapPago(data: any): Pago {
    return {
      id_pago: data.id_pago,
      id_venta: data.id_venta,
      monto: Number(data.monto),
      metodo_pago: data.metodo_pago,
      estado: data.estado,
      fecha_pago: data.fecha_pago,
      referencia: data.referencia ?? '',
    };
  }

  async listPagos(filters?: PagoFilters): Promise<PaginatedPagos> {
    const params: any = {};
    if (filters) {
      if (filters.page)       params.page       = filters.page;
      if (filters.pageSize)   params.page_size  = filters.pageSize;
      if (filters.estado)     params.estado     = filters.estado;
      if (filters.id_venta)   params.id_venta   = filters.id_venta;
      if (filters.metodo_pago) params.metodo_pago = filters.metodo_pago;
      if (filters.search)     params.search     = filters.search;
    }
    const response = await httpClient.get('/pagos/', { params });
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: (response.data.results || []).map((item: any) => this.mapPago(item)),
    };
  }

  async getPago(id: number): Promise<Pago> {
    const response = await httpClient.get(`/pagos/${id}/`);
    return this.mapPago(response.data);
  }

  async createPago(payload: Omit<Pago, 'id_pago' | 'fecha_pago'>): Promise<Pago> {
    const response = await httpClient.post('/pagos/', payload);
    return this.mapPago(response.data);
  }

  async updatePago(id: number, payload: Partial<Pago>): Promise<Pago> {
    const response = await httpClient.patch(`/pagos/${id}/`, payload);
    return this.mapPago(response.data);
  }

  async deletePago(id: number): Promise<void> {
    await httpClient.delete(`/pagos/${id}/`);
  }

  async getStats(): Promise<PagoStats> {
    const response = await httpClient.get('/pagos/stats/');
    return {
      total_pagos: response.data.total_pagos,
      monto_total: Number(response.data.monto_total),
      por_estado: response.data.por_estado,
      por_metodo: response.data.por_metodo,
    };
  }
}
