export interface RepuestoMantenimiento {
  idRepuestoMantenimiento: number;
  mantenimiento: number;
  repuesto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface RepuestoMantenimientoStatsDetail {
  idRepuestoMantenimiento: number;
  mantenimiento: number;
  repuesto: string;
  cantidad: number;
  subtotal: number;
}

export interface RepuestoMantenimientoStats {
  total: number;
  detail: RepuestoMantenimientoStatsDetail[];
}

export interface PaginatedRepuestosMantenimiento {
  count: number;
  next: string | null;
  previous: string | null;
  results: RepuestoMantenimiento[];
}