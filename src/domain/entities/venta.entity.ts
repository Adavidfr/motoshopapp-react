// src/domain/entities/venta.entity.ts

export type VentaEstado = 'pendiente' | 'completada' | 'anulada';

export interface VentaProcesadoPor {
  id: number;
  username: string;
}

export interface Venta {
  id_venta: number;
  id_pedido: number;
  username_cliente: string;
  id_usuario_cliente: number;
  username_vendedor: string;
  id_usuario_vendedor: number;
  total_venta: number;
  total_pagado?: number;
  saldo_pendiente?: number;
  estado: VentaEstado;
  fecha_venta: string;
  num_financiamientos: number;
  financiamientos?: VentaFinanciamientoResumen[];
}

export interface VentaFinanciamientoResumen {
  id_financiamiento: number;
  entidad_financiera: string;
  monto_financiado: number;
  estado: string;
}

/** Solo campos aceptados por VentaCreateSerializer */
export interface VentaCreatePayload {
  id_pedido: number;
}

export interface VentaUpdatePayload {
  estado?: VentaEstado;
  observacion?: string;
}

export interface VentaStats {
  total_ventas: number;
  total_ingresos: number;
  por_estado: Record<VentaEstado, number>;
}

export interface PaginatedVentas {
  count: number;
  next: string | null;
  previous: string | null;
  results: Venta[];
}

/** Respuesta de GET /ventas/{id}/resumen/ */
export interface VentaResumen {
  id: number;
  estado: VentaEstado;
  total_venta: number;
  total_pagado: number;
  saldo_pendiente: number;
  procesado_por: VentaProcesadoPor | null;
  pedido: unknown;
  pagos: unknown[];
  financiamiento: unknown | null;
  facturas: unknown[];
  garantias: unknown[];
  seguros: unknown[];
  documentos: unknown[];
}
