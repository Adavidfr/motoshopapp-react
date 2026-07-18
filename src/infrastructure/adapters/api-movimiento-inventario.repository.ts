// src/infrastructure/adapters/api-movimiento-inventario.repository.ts
import type { MovimientoInventarioRepository } from '../../domain/ports/movimiento-inventario.repository';
import type { MovimientoInventario } from '../../domain/entities/movimiento-inventario.entity';
import { httpClient } from '../http/axios-client';

export class ApiMovimientoInventarioRepository implements MovimientoInventarioRepository {
  private mapMovimiento(data: any): MovimientoInventario {
    return {
      idMovimiento: data.id_movimiento,
      cantidad: data.cantidad,
      tipoMovimiento: data.tipo_movimiento,
      descripcion: data.descripcion || '',
      fechaMovimiento: data.fecha_movimiento,
      idMoto: data.moto?.id_moto || null,
      motoModelo: data.moto?.modelo || '',
      idRepuesto: data.repuesto?.id_repuesto || null,
      repuestoNombre: data.repuesto?.nombre || '',
      idUsuario: data.usuario?.id || 0,
      usuarioNombre: data.usuario?.username || '',
    };
  }

  async listMovimientos(): Promise<MovimientoInventario[]> {
    const response = await httpClient.get('/movimientos-inventario/');
    const list = Array.isArray(response.data) ? response.data : (response.data.results || []);
    return list.map((item: any) => this.mapMovimiento(item));
  }

  async createMovimiento(payload: any): Promise<MovimientoInventario> {
    const response = await httpClient.post('/movimientos-inventario/', payload);
    return this.mapMovimiento(response.data);
  }
}
