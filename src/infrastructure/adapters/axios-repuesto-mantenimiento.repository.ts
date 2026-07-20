import type {
  PaginatedRepuestosMantenimiento,
  RepuestoMantenimiento,
  RepuestoMantenimientoStats,
} from '../../domain/entities/repuesto-mantenimiento.entity';

import type {
  RepuestoMantenimientoDto,
  RepuestoMantenimientoFilters,
} from '../../application/dtos/repuesto-mantenimiento.dto';

import type {
  RepuestoMantenimientoRepository,
} from '../../domain/ports/repuesto-mantenimiento.repository';

import { httpClient } from '../http/axios-client';

export class ApiRepuestoMantenimientoRepository
  implements RepuestoMantenimientoRepository
{
  async getAll(
    filters: RepuestoMantenimientoFilters = {},
  ): Promise<PaginatedRepuestosMantenimiento> {
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

    if (filters.mantenimiento !== undefined) {
      params.mantenimiento =
        filters.mantenimiento;
    }

    if (filters.repuesto !== undefined) {
      params.repuesto = filters.repuesto;
    }

    if (filters.ordering?.trim()) {
      params.ordering = filters.ordering.trim();
    }

    const response =
      await httpClient.get(
        '/repuestos-mantenimiento/',
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
              this.mapRepuestoMantenimiento(
                item,
              ),
          )
        : [],
    };
  }

  async getById(
    id: number,
  ): Promise<RepuestoMantenimiento> {
    const response =
      await httpClient.get(
        `/repuestos-mantenimiento/${id}/`,
      );

    return this.mapRepuestoMantenimiento(
      response.data,
    );
  }

  async getStats(): Promise<RepuestoMantenimientoStats> {
    const response =
      await httpClient.get(
        '/repuestos-mantenimiento/stats/',
      );

    const data = response.data;

    return {
      total: Number(data.total ?? 0),
      detail: Array.isArray(data.detail)
        ? data.detail.map(
            (item: unknown) =>
              this.mapStatsDetail(item),
          )
        : [],
    };
  }

  async create(
    dto: RepuestoMantenimientoDto,
  ): Promise<RepuestoMantenimiento> {
    const response =
      await httpClient.post(
        '/repuestos-mantenimiento/',
        this.preparePayload(dto),
      );

    return this.mapRepuestoMantenimiento(
      response.data,
    );
  }

  async update(
    id: number,
    dto: Partial<RepuestoMantenimientoDto>,
  ): Promise<RepuestoMantenimiento> {
    const response =
      await httpClient.patch(
        `/repuestos-mantenimiento/${id}/`,
        this.preparePayload(dto),
      );

    return this.mapRepuestoMantenimiento(
      response.data,
    );
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(
      `/repuestos-mantenimiento/${id}/`,
    );
  }

  private preparePayload(
    dto: Partial<RepuestoMantenimientoDto>,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (dto.mantenimiento !== undefined) {
      payload.mantenimiento =
        dto.mantenimiento;
    }

    if (dto.repuesto !== undefined) {
      payload.repuesto = dto.repuesto;
    }

    if (dto.cantidad !== undefined) {
      payload.cantidad = dto.cantidad;
    }

    if (dto.precioUnitario !== undefined) {
      payload.precio_unitario =
        dto.precioUnitario.toFixed(2);
    }

    if (dto.subtotal !== undefined) {
      payload.subtotal =
        dto.subtotal.toFixed(2);
    }

    return payload;
  }

  private mapRepuestoMantenimiento(
    value: unknown,
  ): RepuestoMantenimiento {
    const data = this.toRecord(value);

    return {
      idRepuestoMantenimiento: Number(
        data.id_repuesto_mantenimiento ?? 0,
      ),
      mantenimiento: Number(
        data.mantenimiento ?? 0,
      ),
      repuesto: Number(
        data.repuesto ?? 0,
      ),
      cantidad: Number(
        data.cantidad ?? 0,
      ),
      precioUnitario: Number(
        data.precio_unitario ?? 0,
      ),
      subtotal: Number(
        data.subtotal ?? 0,
      ),
    };
  }

  private mapStatsDetail(
    value: unknown,
  ): RepuestoMantenimientoStats['detail'][number] {
    const data = this.toRecord(value);

    return {
      idRepuestoMantenimiento: Number(
        data.id ?? 0,
      ),
      mantenimiento: Number(
        data.mantenimiento ?? 0,
      ),
      repuesto:
        typeof data.repuesto === 'string'
          ? data.repuesto
          : '',
      cantidad: Number(
        data.cantidad ?? 0,
      ),
      subtotal: Number(
        data.subtotal ?? 0,
      ),
    };
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