export type MantenimientoEstado =
  | 'Pendiente'
  | 'En proceso'
  | 'Finalizado'
  | 'Cancelado';

export interface Mantenimiento {
  idMantenimiento: number;
  moto: number;
  usuarioCliente: number;
  servicio: number;
  kilometrajeActual: number;
  diagnosticoInicial: string | null;
  costoFinal: number;
  estado: MantenimientoEstado;
  fechaRegistro: string;
}

export interface MantenimientoStatsDetail {
  idMantenimiento: number;
  moto: string;
  usuarioCliente: string;
  servicio: string;
  kilometrajeActual: number;
  costoFinal: number;
  estado: MantenimientoEstado;
  fechaRegistro: string;
}

export interface MantenimientoStats {
  total: number;
  pendientes: number;
  enProceso: number;
  finalizados: number;
  cancelados: number;
  detail: MantenimientoStatsDetail[];
}

export interface PaginatedMantenimientos {
  count: number;
  next: string | null;
  previous: string | null;
  results: Mantenimiento[];
}