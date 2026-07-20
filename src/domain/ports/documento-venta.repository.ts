// src/domain/ports/documento-venta.repository.ts
import type { DocumentoVenta, PaginatedDocumentosVenta } from '../entities/documento-venta.entity';

export interface DocumentoVentaFilters {
  page?: number;
  pageSize?: number;
  id_venta?: number;
  tipo_documento?: string;
  search?: string;
}

export interface DocumentoVentaRepository {
  listDocumentos(filters?: DocumentoVentaFilters): Promise<PaginatedDocumentosVenta>;
  getDocumento(id: number): Promise<DocumentoVenta>;
  createDocumento(payload: Omit<DocumentoVenta, 'id_documento' | 'fecha_subida'>): Promise<DocumentoVenta>;
  updateDocumento(id: number, payload: Partial<DocumentoVenta>): Promise<DocumentoVenta>;
  deleteDocumento(id: number): Promise<void>;
}
