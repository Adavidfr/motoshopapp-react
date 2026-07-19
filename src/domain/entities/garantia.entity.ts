// src/domain/entities/garantia.entity.ts

export type GarantiaEstado = 'activa' | 'vencida' | 'anulada';

export interface Garantia {
  id_garantia: number;
  id_venta: number;
  id_moto: number;
  meses_garantia: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  estado: GarantiaEstado;
}

export interface PaginatedGarantias {
  count: number;
  next: string | null;
  previous: string | null;
  results: Garantia[];
}
