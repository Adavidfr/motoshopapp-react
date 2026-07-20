// src/domain/entities/seguro.entity.ts

export type SeguroEstado = 'activo' | 'vencido' | 'cancelado';

export interface Seguro {
  id_seguro: number;
  id_venta: number;
  aseguradora: string;
  numero_poliza: string;
  tipo_cobertura: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo_anual: number;
  estado: SeguroEstado;
}

export interface PaginatedSeguros {
  count: number;
  next: string | null;
  previous: string | null;
  results: Seguro[];
}
