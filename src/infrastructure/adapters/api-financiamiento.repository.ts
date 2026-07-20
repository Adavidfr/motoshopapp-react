// src/infrastructure/adapters/api-financiamiento.repository.ts
import type { FinanciamientoRepository, FinanciamientoFilters } from '../../domain/ports/financiamiento.repository';
import type { Financiamiento, FinanciamientoStats, PaginatedFinanciamientos } from '../../domain/entities/financiamiento.entity';
import { httpClient } from '../http/axios-client';

export class ApiFinanciamientoRepository implements FinanciamientoRepository {
  private mapFinanciamiento(data: any): Financiamiento {
    return {
      id_financiamiento: data.id_financiamiento,
      id_venta: data.id_venta,
      entidad_financiera: data.entidad_financiera,
      monto_financiado: Number(data.monto_financiado),
      tasa_interes: Number(data.tasa_interes),
      plazo_meses: Number(data.plazo_meses),
      cuota_mensual: Number(data.cuota_mensual),
      estado: data.estado,
    };
  }

  async listFinanciamientos(filters?: FinanciamientoFilters): Promise<PaginatedFinanciamientos> {
    const params: any = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.estado) params.estado = filters.estado;
      if (filters.id_venta) params.id_venta = filters.id_venta;
      if (filters.entidad_financiera) params.entidad_financiera = filters.entidad_financiera;
    }
    const response = await httpClient.get('/financiamientos/', { params });
    return {
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
      results: (response.data.results || []).map((item: any) => this.mapFinanciamiento(item)),
    };
  }

  async getFinanciamiento(id: number): Promise<Financiamiento> {
    const response = await httpClient.get(`/financiamientos/${id}/`);
    return this.mapFinanciamiento(response.data);
  }

  async createFinanciamiento(payload: Omit<Financiamiento, 'id_financiamiento'>): Promise<Financiamiento> {
    const response = await httpClient.post('/financiamientos/', payload);
    return this.mapFinanciamiento(response.data);
  }

  async updateFinanciamiento(id: number, payload: Partial<Financiamiento>): Promise<Financiamiento> {
    const response = await httpClient.patch(`/financiamientos/${id}/`, payload);
    return this.mapFinanciamiento(response.data);
  }

  async deleteFinanciamiento(id: number): Promise<void> {
    await httpClient.delete(`/financiamientos/${id}/`);
  }

  async getStats(): Promise<FinanciamientoStats> {
    const response = await httpClient.get('/financiamientos/stats/');
    return {
      total_financiamientos: response.data.total_financiamientos,
      monto_total: Number(response.data.monto_total),
      monto_promedio: Number(response.data.monto_promedio),
      cuota_promedio: Number(response.data.cuota_promedio),
      plazo_promedio_meses: Number(response.data.plazo_promedio_meses),
      por_estado: response.data.por_estado,
    };
  }
}
