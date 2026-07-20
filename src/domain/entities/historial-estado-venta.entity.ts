// src/domain/entities/historial-estado-venta.entity.ts

export interface HistorialEstadoVenta {
  id_historial: number;
  id_venta: number;
  estado_anterior: string;
  estado_nuevo: string;
  fecha_cambio: string;
  observacion: string;
}

export interface PaginatedHistorialEstadoVenta {
  count: number;
  next: string | null;
  previous: string | null;
  results: HistorialEstadoVenta[];
}
