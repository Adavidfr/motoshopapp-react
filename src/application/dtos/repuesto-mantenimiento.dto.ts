export interface RepuestoMantenimientoDto {
  mantenimiento: number;
  repuesto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface RepuestoMantenimientoFilters {
  page?: number;
  pageSize?: number;
  search?: string;

  mantenimiento?: number;
  repuesto?: number;

  ordering?: string;
}