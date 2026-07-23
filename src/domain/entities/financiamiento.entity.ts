// src/domain/entities/financiamiento.entity.ts

export type FinanciamientoEstado = 'activo' | 'pagado' | 'vencido' | 'cancelado';

/** Transiciones válidas según FINANCIAMIENTO_TRANSICIONES en Django */
export const FINANCIAMIENTO_ESTADOS: FinanciamientoEstado[] = [
  'activo',
  'pagado',
  'vencido',
  'cancelado',
];

export const FINANCIAMIENTO_TRANSICIONES: Record<FinanciamientoEstado, FinanciamientoEstado[]> = {
  activo: ['pagado', 'vencido', 'cancelado'],
  pagado: [],
  vencido: ['pagado', 'cancelado'],
  cancelado: [],
};

export function transicionesFinanciamientoPermitidas(
  estado: FinanciamientoEstado,
): FinanciamientoEstado[] {
  return FINANCIAMIENTO_TRANSICIONES[estado] ?? [];
}

export interface Financiamiento {
  id_financiamiento: number;
  id_venta: number;
  entidad_financiera: string;
  monto_financiado: number;
  entrada: number;
  saldo_pendiente: number;
  tasa_interes: number;
  plazo_meses: number;
  cuota_mensual: number;
  estado: FinanciamientoEstado;
}

/** Campos aceptados por FinanciamientoCreateSerializer / POST financiar */
export interface FinanciamientoCreatePayload {
  entidad_financiera: string;
  monto_financiado: number;
  entrada?: number;
  tasa_interes: number;
  plazo_meses: number;
  estado?: FinanciamientoEstado;
}

/** PATCH parcial — el backend expone CRUD; saldo y cuota son read-only en serializer */
export interface FinanciamientoUpdatePayload {
  estado?: FinanciamientoEstado;
  entidad_financiera?: string;
}

export interface FinanciamientoStats {
  total_financiamientos: number;
  monto_total: number;
  monto_promedio: number;
  cuota_promedio: number;
  plazo_promedio_meses: number;
  por_estado: Record<FinanciamientoEstado, number>;
}

export interface PaginatedFinanciamientos {
  count: number;
  next: string | null;
  previous: string | null;
  results: Financiamiento[];
}
