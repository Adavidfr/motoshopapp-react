// src/domain/entities/documento-venta.entity.ts

export type DocumentoVentaTipo =
  | 'contrato'
  | 'factura'
  | 'soat'
  | 'garantia'
  | 'traspaso'
  | 'otro';

/** Alias histórico — preferir DocumentoVentaTipo */
export type DocumentoTipo = DocumentoVentaTipo;

export const DOCUMENTO_VENTA_MAX_BYTES = 10 * 1024 * 1024;
export const DOCUMENTO_VENTA_EXTENSIONES = ['.pdf', '.jpg', '.jpeg', '.png'] as const;
export const DOCUMENTO_VENTA_ACCEPT = '.pdf,.jpg,.jpeg,.png';

export interface DocumentoVentaSubidoPor {
  id: number;
  username: string;
}

/** Respuesta de la API — archivo_url es URL relativa o absoluta de lectura, no un File. */
export interface DocumentoVenta {
  id_documento: number;
  id_venta: number;
  tipo_documento: DocumentoVentaTipo;
  archivo_url: string;
  nombre_original: string;
  tamano_bytes: number;
  content_type: string;
  subido_por: number | null;
  subido_por_info: DocumentoVentaSubidoPor | null;
  fecha_subida: string;
}

/** Payload multipart — archivo es File local del usuario. */
export interface DocumentoVentaCreatePayload {
  id_venta: number;
  tipo_documento: DocumentoVentaTipo;
  archivo: File;
}

export interface DocumentoVentaDownload {
  blob: Blob;
  filename: string;
}

export interface PaginatedDocumentosVenta {
  count: number;
  next: string | null;
  previous: string | null;
  results: DocumentoVenta[];
}
