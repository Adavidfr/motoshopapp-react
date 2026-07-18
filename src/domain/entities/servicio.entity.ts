export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: string;
  tiempo_estimado_minutos: number;
  estado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ServicioStatsDetail {
  id: number;
  nombre: string;
  precio_base: string;
  tiempo_estimado_minutos: number;
  estado: boolean;
}

export interface ServicioStats {
  total: number;
  activos: number;
  inactivos: number;
  detail: ServicioStatsDetail[];
}

export interface PaginatedServicios {
  count: number;
  next: string | null;
  previous: string | null;
  results: Servicio[];
}