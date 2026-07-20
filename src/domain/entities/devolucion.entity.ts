// src/domain/entities/devolucion.entity.ts

export type DevolucionEstado = 'solicitada' | 'aprobada' | 'rechazada' | 'completada';

export interface Devolucion {
  id_devolucion: number;
  id_venta: number;
  motivo: string;
  estado: DevolucionEstado;
  monto_devolucion: number;
  fecha_solicitud: string;
  fecha_resolucion: string | null;
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
