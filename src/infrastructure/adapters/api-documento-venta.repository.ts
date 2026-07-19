// src/infrastructure/adapters/api-documento-venta.repository.ts
import type { DocumentoVentaRepository, DocumentoVentaFilters } from '../../domain/ports/documento-venta.repository';
import type { DocumentoVenta, PaginatedDocumentosVenta } from '../../domain/entities/documento-venta.entity';
import { httpClient } from '../http/axios-client';

export class ApiDocumentoVentaRepository implements DocumentoVentaRepository {
  private map(data: any): DocumentoVenta {
    return {
      id_documento:   data.id_documento,
      id_venta:       data.id_venta,
      tipo_documento: data.tipo_documento,
      archivo_url:    data.archivo_url,
      fecha_subida:   data.fecha_subida,
    };
  }

  async listDocumentos(filters?: DocumentoVentaFilters): Promise<PaginatedDocumentosVenta> {
    const params: any = {};
    if (filters) {
      if (filters.page)           params.page           = filters.page;
      if (filters.pageSize)       params.page_size      = filters.pageSize;
      if (filters.tipo_documento) params.tipo_documento = filters.tipo_documento;
      if (filters.id_venta)       params.id_venta       = filters.id_venta;
      if (filters.search)         params.search         = filters.search;
    }
    const res = await httpClient.get('/documentos-venta/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i: any) => this.map(i)),
    };
  }

  async getDocumento(id: number): Promise<DocumentoVenta> {
    const res = await httpClient.get(`/documentos-venta/${id}/`);
    return this.map(res.data);
  }

  async createDocumento(payload: Omit<DocumentoVenta, 'id_documento' | 'fecha_subida'>): Promise<DocumentoVenta> {
    const res = await httpClient.post('/documentos-venta/', payload);
    return this.map(res.data);
  }

  async updateDocumento(id: number, payload: Partial<DocumentoVenta>): Promise<DocumentoVenta> {
    const res = await httpClient.patch(`/documentos-venta/${id}/`, payload);
    return this.map(res.data);
  }

  async deleteDocumento(id: number): Promise<void> {
    await httpClient.delete(`/documentos-venta/${id}/`);
  }
}
