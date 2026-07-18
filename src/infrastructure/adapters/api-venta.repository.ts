// src/infrastructure/adapters/api-venta.repository.ts
import type { VentaRepository, VentaFilters } from '../../domain/ports/venta.repository';
import type { Venta, VentaStats, PaginatedVentas } from '../../domain/entities/venta.entity';
import type { Financiamiento } from '../../domain/entities/financiamiento.entity';
import { httpClient } from '../http/axios-client';

export class ApiVentaRepository implements VentaRepository {
  private mapVenta(data: any): Venta {
    return {
      id_venta: data.id_venta,
      id_pedido: data.id_pedido,
      username_cliente: data.username_cliente,
      id_usuario_cliente: data.id_usuario_cliente,
      username_vendedor: data.username_vendedor,
      id_usuario_vendedor: data.id_usuario_vendedor,
      total_venta: Number(data.total_venta),
      estado: data.estado,
      fecha_venta: data.fecha_venta,
      num_financiamientos: Number(data.num_financiamientos),
      financiamientos: data.financiamientos || [],
    };
  }

  async listVentas(filters?: VentaFilters): Promise<PaginatedVentas> {
    const params: any = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.estado) params.estado = filters.estado;
      if (filters.search) params.search = filters.search;
    }
    const response = await httpClient.get('/ventas/', { params });
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: (response.data.results || []).map((item: any) => this.mapVenta(item)),
    };
  }

  async getVenta(id: number): Promise<Venta> {
    const response = await httpClient.get(`/ventas/${id}/`);
    return this.mapVenta(response.data);
  }

  async createVenta(payload: { id_pedido: number; total_venta: string; estado: string }): Promise<Venta> {
    const response = await httpClient.post('/ventas/', payload);
    return this.mapVenta(response.data);
  }

  async updateVenta(id: number, payload: Partial<Venta>): Promise<Venta> {
    const response = await httpClient.patch(`/ventas/${id}/`, payload);
    return this.mapVenta(response.data);
  }

  async deleteVenta(id: number): Promise<void> {
    await httpClient.delete(`/ventas/${id}/`);
  }

  async getStats(): Promise<VentaStats> {
    const response = await httpClient.get('/ventas/stats/');
    return {
      total_ventas: response.data.total_ventas,
      total_ingresos: Number(response.data.total_ingresos),
      por_estado: response.data.por_estado,
    };
  }

  async financiarVenta(id: number, payload: Omit<Financiamiento, 'id_financiamiento' | 'id_venta'>): Promise<Financiamiento> {
    const response = await httpClient.post(`/ventas/${id}/financiar/`, payload);
    return {
      id_financiamiento: response.data.id_financiamiento,
      id_venta: response.data.id_venta,
      entidad_financiera: response.data.entidad_financiera,
      monto_financiado: Number(response.data.monto_financiado),
      tasa_interes: Number(response.data.tasa_interes),
      plazo_meses: Number(response.data.plazo_meses),
      cuota_mensual: Number(response.data.cuota_mensual),
      estado: response.data.estado,
    };
  }
}
