// src/infrastructure/adapters/api-documento-venta.repository.ts
import type { DocumentoVentaRepository, DocumentoVentaFilters } from '../../domain/ports/documento-venta.repository';
import type {
  DocumentoVenta,
  DocumentoVentaCreatePayload,
  DocumentoVentaDownload,
  PaginatedDocumentosVenta,
} from '../../domain/entities/documento-venta.entity';
import { httpClient } from '../http/axios-client';

interface ApiDocumentoVenta {
  id_documento: number;
  id_venta: number;
  tipo_documento: DocumentoVenta['tipo_documento'];
  archivo_url: string;
  archivo_url_legacy?: string;
  nombre_original: string;
  tamano_bytes: number;
  content_type: string;
  subido_por: number | null;
  subido_por_info: DocumentoVenta['subido_por_info'];
  fecha_subida: string;
}

function parseFilename(contentDisposition: string | undefined): string {
  if (!contentDisposition) return 'documento';
  const match = /filename="([^"]+)"/.exec(contentDisposition);
  return match?.[1] ?? 'documento';
}

export class ApiDocumentoVentaRepository implements DocumentoVentaRepository {
  private map(data: ApiDocumentoVenta): DocumentoVenta {
    return {
      id_documento: data.id_documento,
      id_venta: data.id_venta,
      tipo_documento: data.tipo_documento,
      archivo_url: data.archivo_url ?? '',
      nombre_original: data.nombre_original ?? '',
      tamano_bytes: Number(data.tamano_bytes ?? 0),
      content_type: data.content_type ?? '',
      subido_por: data.subido_por,
      subido_por_info: data.subido_por_info,
      fecha_subida: data.fecha_subida,
    };
  }

  async listDocumentos(filters?: DocumentoVentaFilters): Promise<PaginatedDocumentosVenta> {
    const params: Record<string, string | number> = {};
    if (filters) {
      if (filters.page) params.page = filters.page;
      if (filters.pageSize) params.page_size = filters.pageSize;
      if (filters.tipo_documento) params.tipo_documento = filters.tipo_documento;
      if (filters.id_venta) params.id_venta = filters.id_venta;
      if (filters.search) params.search = filters.search;
    }
    const res = await httpClient.get<{ count: number; next: string | null; previous: string | null; results: ApiDocumentoVenta[] }>('/documentos-venta/', { params });
    return {
      count: res.data.count,
      next: res.data.next,
      previous: res.data.previous,
      results: (res.data.results || []).map((i) => this.map(i)),
    };
  }

  async getDocumento(id: number): Promise<DocumentoVenta> {
    const res = await httpClient.get<ApiDocumentoVenta>(`/documentos-venta/${id}/`);
    return this.map(res.data);
  }

  async createDocumento(payload: DocumentoVentaCreatePayload): Promise<DocumentoVenta> {
    const formData = new FormData();
    formData.append('id_venta', String(payload.id_venta));
    formData.append('tipo_documento', payload.tipo_documento);
    formData.append('archivo', payload.archivo);

    const res = await httpClient.post<ApiDocumentoVenta>('/documentos-venta/', formData);
    return this.map(res.data);
  }

  async deleteDocumento(id: number): Promise<void> {
    await httpClient.delete(`/documentos-venta/${id}/`);
  }

  async downloadDocumentoArchivo(id: number): Promise<DocumentoVentaDownload> {
    const res = await httpClient.get<Blob>(`/documentos-venta/${id}/archivo/`, {
      responseType: 'blob',
    });
    return {
      blob: res.data,
      filename: parseFilename(res.headers['content-disposition'] as string | undefined),
    };
  }
}
