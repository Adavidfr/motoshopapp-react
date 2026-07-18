// src/domain/entities/financiamiento.entity.ts

export type FinanciamientoEstado = 'activo' | 'pagado' | 'vencido' | 'cancelado';

export interface Financiamiento {
  id_financiamiento: number;
  id_venta: number;
  entidad_financiera: string;
  monto_financiado: number;
  tasa_interes: number;
  plazo_meses: number;
  cuota_mensual: number;
  estado: FinanciamientoEstado;
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
