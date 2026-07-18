import type {
  Mantenimiento,
  MantenimientoStats,
  PaginatedMantenimientos,
} from '../../domain/entities/mantenimiento.entity';

import type {
  MantenimientoDto,
  MantenimientoFilters,
} from '../../application/dtos/mantenimiento.dto';

import type {
  MantenimientoRepository,
} from '../../domain/ports/mantenimiento.repository';

import { httpClient } from '../http/axios-client';

export class ApiMantenimientoRepository
  implements MantenimientoRepository
{
  async getAll(
    filters: MantenimientoFilters = {},
  ): Promise<PaginatedMantenimientos> {
    const params: Record<
      string,
      string | number | boolean
    > = {};

    if (filters.page !== undefined) {
      params.page = filters.page;
    }

    if (filters.pageSize !== undefined) {
      params.page_size = filters.pageSize;
    }

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.moto !== undefined) {
      params.moto = filters.moto;
    }

    if (filters.usuarioCliente !== undefined) {
      params.usuario_cliente =
        filters.usuarioCliente;
    }

    if (filters.servicio !== undefined) {
      params.servicio = filters.servicio;
    }

    if (filters.estado?.trim()) {
      params.estado = filters.estado.trim();
    }

    if (filters.fechaRegistroAfter?.trim()) {
      params.fecha_registro_after =
        filters.fechaRegistroAfter.trim();
    }

    if (filters.fechaRegistroBefore?.trim()) {
      params.fecha_registro_before =
        filters.fechaRegistroBefore.trim();
    }

    if (filters.ordering?.trim()) {
      params.ordering = filters.ordering.trim();
    }

    const response =
      await httpClient.get(
        '/mantenimientos/',
        { params },
      );

    return {
      count: Number(response.data.count ?? 0),
      next: response.data.next ?? null,
      previous: response.data.previous ?? null,
      results: Array.isArray(
        response.data.results,
      )
        ? response.data.results.map(
            (item: unknown) =>
              this.mapMantenimiento(item),
          )
        : [],
    };
  }

  async getById(
    id: number,
  ): Promise<Mantenimiento> {
    const response =
      await httpClient.get(
        `/mantenimientos/${id}/`,
      );

    return this.mapMantenimiento(
      response.data,
    );
  }

  async getStats(): Promise<MantenimientoStats> {
    const response =
      await httpClient.get(
        '/mantenimientos/stats/',
      );

    const data = response.data;

    return {
      total: Number(data.total ?? 0),
      pendientes: Number(
        data.pendientes ?? 0,
      ),
      enProceso: Number(
        data.en_proceso ?? 0,
      ),
      finalizados: Number(
        data.finalizados ?? 0,
      ),
      cancelados: Number(
        data.cancelados ?? 0,
      ),
      detail: Array.isArray(data.detail)
        ? data.detail.map(
            (item: unknown) =>
              this.mapStatsDetail(item),
          )
        : [],
    };
  }

  async create(
    dto: MantenimientoDto,
  ): Promise<Mantenimiento> {
    const response =
      await httpClient.post(
        '/mantenimientos/',
        this.preparePayload(dto),
      );

    return this.mapMantenimiento(
      response.data,
    );
  }

  async update(
    id: number,
    dto: Partial<MantenimientoDto>,
  ): Promise<Mantenimiento> {
    const response =
      await httpClient.patch(
        `/mantenimientos/${id}/`,
        this.preparePayload(dto),
      );

    return this.mapMantenimiento(
      response.data,
    );
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(
      `/mantenimientos/${id}/`,
    );
  }

  private preparePayload(
    dto: Partial<MantenimientoDto>,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (dto.moto !== undefined) {
      payload.moto = dto.moto;
    }

    if (dto.usuarioCliente !== undefined) {
      payload.usuario_cliente =
        dto.usuarioCliente;
    }

    if (dto.servicio !== undefined) {
      payload.servicio = dto.servicio;
    }

    if (
      dto.kilometrajeActual !== undefined
    ) {
      payload.kilometraje_actual =
        dto.kilometrajeActual;
    }

    if (
      dto.diagnosticoInicial !== undefined
    ) {
      payload.diagnostico_inicial =
        dto.diagnosticoInicial?.trim() ||
        null;
    }

    if (dto.costoFinal !== undefined) {
      payload.costo_final =
        dto.costoFinal.toFixed(2);
    }

    if (dto.estado !== undefined) {
      payload.estado = dto.estado;
    }

    return payload;
  }

  private mapMantenimiento(
    value: unknown,
  ): Mantenimiento {
    const data =
      this.toRecord(value);

    return {
      idMantenimiento: Number(
        data.id_mantenimiento ?? 0,
      ),
      moto: Number(data.moto ?? 0),
      usuarioCliente: Number(
        data.usuario_cliente ?? 0,
      ),
      servicio: Number(
        data.servicio ?? 0,
      ),
      kilometrajeActual: Number(
        data.kilometraje_actual ?? 0,
      ),
      diagnosticoInicial:
        typeof data.diagnostico_inicial ===
        'string'
          ? data.diagnostico_inicial
          : null,
      costoFinal: Number(
        data.costo_final ?? 0,
      ),
      estado: this.mapEstado(
        data.estado,
      ),
      fechaRegistro:
        typeof data.fecha_registro ===
        'string'
          ? data.fecha_registro
          : '',
    };
  }

  private mapStatsDetail(
    value: unknown,
  ): MantenimientoStats['detail'][number] {
    const data =
      this.toRecord(value);

    return {
      idMantenimiento: Number(
        data.id_mantenimiento ?? 0,
      ),
      moto:
        typeof data.moto === 'string'
          ? data.moto
          : '',
      usuarioCliente:
        typeof data.usuario_cliente ===
        'string'
          ? data.usuario_cliente
          : '',
      servicio:
        typeof data.servicio === 'string'
          ? data.servicio
          : '',
      kilometrajeActual: Number(
        data.kilometraje_actual ?? 0,
      ),
      costoFinal: Number(
        data.costo_final ?? 0,
      ),
      estado: this.mapEstado(
        data.estado,
      ),
      fechaRegistro:
        typeof data.fecha_registro ===
        'string'
          ? data.fecha_registro
          : '',
    };
  }

  private mapEstado(
    value: unknown,
  ): Mantenimiento['estado'] {
    switch (value) {
      case 'En proceso':
      case 'Finalizado':
      case 'Cancelado':
        return value;

      default:
        return 'Pendiente';
    }
  }

  private toRecord(
    value: unknown,
  ): Record<string, unknown> {
    if (
      typeof value === 'object' &&
      value !== null
    ) {
      return value as Record<
        string,
        unknown
      >;
    }

    return {};
  }
}