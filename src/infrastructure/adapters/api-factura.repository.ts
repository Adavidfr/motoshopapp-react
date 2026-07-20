// src/infrastructure/adapters/api-factura.repository.ts
import type { FacturaRepository, FacturaFilters } from '../../domain/ports/factura.repository';
import type { Factura, PaginatedFacturas } from '../../domain/entities/factura.entity';
import { httpClient } from '../http/axios-client';

export class ApiFacturaRepository implements FacturaRepository {
  private map(data: any): Factura {
    return {
      id_factura:     data.id_factura,
      id_venta:       data.id_venta,
      numero_factura: data.numero_factura,
      fecha_emision:  data.fecha_emision,
      subtotal:       Number(data.subtotal),
      iva:            Number(data.iva),
      total:          Number(data.total),
    };
  }

  async listFacturas(filters?: FacturaFilters): Promise<PaginatedFacturas> {
    const params: any = {};
    if (filters) {
      if (filters.page)     params.page      = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.id_venta) params.id_venta  = filters.id_venta;
      if (filters.search)   params.search    = filters.search;
    }
    const res = await httpClient.get('/facturas/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i: any) => this.map(i)),
    };
  }

  async getFactura(id: number): Promise<Factura> {
    const res = await httpClient.get(`/facturas/${id}/`);
    return this.map(res.data);
  }

  async createFactura(payload: Omit<Factura, 'id_factura' | 'fecha_emision'>): Promise<Factura> {
    const res = await httpClient.post('/facturas/', payload);
    return this.map(res.data);
  }

  async updateFactura(id: number, payload: Partial<Factura>): Promise<Factura> {
    const res = await httpClient.patch(`/facturas/${id}/`, payload);
    return this.map(res.data);
  }

  async deleteFactura(id: number): Promise<void> {
    await httpClient.delete(`/facturas/${id}/`);
  }
}
