// src/infrastructure/adapters/api-factura.repository.ts
import type { FacturaRepository, FacturaFilters } from '../../domain/ports/factura.repository';
import type { Factura, FacturaCreatePayload, PaginatedFacturas } from '../../domain/entities/factura.entity';
import { httpClient } from '../http/axios-client';

interface ApiFactura {
  id_factura: number;
  id_venta: number;
  numero_factura: string;
  fecha_emision: string;
  subtotal: string | number;
  iva: string | number;
  total: string | number;
}

function parseDecimal(value: string | number): number {
  return Number(value);
}

export class ApiFacturaRepository implements FacturaRepository {
  private map(data: ApiFactura): Factura {
    return {
      id_factura: data.id_factura,
      id_venta: data.id_venta,
      numero_factura: data.numero_factura,
      fecha_emision: data.fecha_emision,
      subtotal: parseDecimal(data.subtotal),
      iva: parseDecimal(data.iva),
      total: parseDecimal(data.total),
    };
  }

  async listFacturas(filters?: FacturaFilters): Promise<PaginatedFacturas> {
    const params: Record<string, string | number> = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.id_venta) params.id_venta = filters.id_venta;
      if (filters.search) params.search = filters.search;
      if (filters.numero_factura) params.numero_factura = filters.numero_factura;
    }
    const res = await httpClient.get<{ count: number; next: string | null; previous: string | null; results: ApiFactura[] }>('/facturas/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i) => this.map(i)),
    };
  }

  async getFactura(id: number): Promise<Factura> {
    const res = await httpClient.get<ApiFactura>(`/facturas/${id}/`);
    return this.map(res.data);
  }

  async createFactura(payload: FacturaCreatePayload): Promise<Factura> {
    const res = await httpClient.post<ApiFactura>('/facturas/', {
      id_venta: payload.id_venta,
    });
    return this.map(res.data);
  }
}
