// src/domain/entities/devolucion.entity.ts

export type DevolucionEstado = 'solicitada' | 'aprobada' | 'rechazada' | 'completada';

/** Plazo máximo desde fecha_venta (constante backend DEVOLUCION_PLAZO_DIAS). */
export const DEVOLUCION_PLAZO_DIAS = 30;

export interface Devolucion {
  id_devolucion: number;
  id_venta: number;
  motivo: string;
  estado: DevolucionEstado;
  monto_devolucion: number;
  monto_reembolso_aplicado: number;
  stock_reintegrado: boolean;
  fecha_solicitud: string;
  fecha_resolucion: string | null;
}

/** Devolución total por venta — monto 0 = devolución física sin reembolso. */
export interface DevolucionCreatePayload {
  id_venta: number;
  motivo: string;
  monto_devolucion: number;
}

export interface DevolucionStats {
  total_devoluciones: number;
  monto_total: number;
  por_estado: Record<DevolucionEstado, number>;
}

export interface PaginatedDevoluciones {
  count: number;
  next: string | null;
  previous: string | null;
  results: Devolucion[];
}

/** Transiciones expuestas por la API (completada no tiene endpoint). */
export const DEVOLUCION_TRANSICIONES_API: Record<DevolucionEstado, DevolucionEstado[]> = {
  solicitada: ['aprobada', 'rechazada'],
  aprobada: [],
  rechazada: [],
  completada: [],
};
