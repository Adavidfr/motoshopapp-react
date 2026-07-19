// src/domain/entities/documento-venta.entity.ts

export type DocumentoTipo = 'contrato' | 'factura' | 'soat' | 'garantia' | 'traspaso' | 'otro';

export interface DocumentoVenta {
  id_documento: number;
  id_venta: number;
  tipo_documento: DocumentoTipo;
  archivo_url: string;
  fecha_subida: string;
}

export interface PaginatedDocumentosVenta {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentoVenta[];
}
