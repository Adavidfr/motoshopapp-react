// src/domain/entities/seguro.entity.ts

export type SeguroEstado = 'activo' | 'vencido' | 'cancelado';

export interface Seguro {
  id_seguro: number;
  id_venta: number;
  aseguradora: string;
  /** Generado por Django (POL-YYYY-######). Solo lectura. */
  numero_poliza: string;
  tipo_cobertura: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo_anual: number;
  estado: SeguroEstado;
}

/** Payload de creación — sin numero_poliza (lo genera el servidor). */
export interface SeguroCreatePayload {
  id_venta: number;
  aseguradora: string;
  tipo_cobertura: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo_anual: number;
  estado?: SeguroEstado;
}

/** Payload de actualización — numero_poliza no es editable. */
export interface SeguroUpdatePayload {
  id_venta?: number;
  aseguradora?: string;
  tipo_cobertura?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  costo_anual?: number;
  estado?: SeguroEstado;
}

export interface PaginatedSeguros {
  count: number;
  next: string | null;
  previous: string | null;
  results: Seguro[];
}
