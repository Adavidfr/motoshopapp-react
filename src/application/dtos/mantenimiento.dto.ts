import type {
  MantenimientoEstado,
} from '../../domain/entities/mantenimiento.entity';

export interface MantenimientoDto {
  moto: number;
  usuarioCliente: number;
  servicio: number;
  kilometrajeActual: number;
  diagnosticoInicial?: string | null;
  costoFinal: number;
  estado: MantenimientoEstado;
}

export interface MantenimientoFilters {
  page?: number;
  pageSize?: number;
  search?: string;

  moto?: number;
  usuarioCliente?: number;
  servicio?: number;
  estado?: string;

  fechaRegistroAfter?: string;
  fechaRegistroBefore?: string;

  ordering?: string;
}