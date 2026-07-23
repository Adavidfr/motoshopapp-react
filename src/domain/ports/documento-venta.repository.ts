// src/domain/ports/documento-venta.repository.ts
import type {
  DocumentoVenta,
  DocumentoVentaCreatePayload,
  DocumentoVentaDownload,
  PaginatedDocumentosVenta,
} from '../entities/documento-venta.entity';

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
  createDocumento(payload: DocumentoVentaCreatePayload): Promise<DocumentoVenta>;
  deleteDocumento(id: number): Promise<void>;
  downloadDocumentoArchivo(id: number): Promise<DocumentoVentaDownload>;
}
