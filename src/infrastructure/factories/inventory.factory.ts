// src/infrastructure/factories/inventory.factory.ts
import { ApiMovimientoInventarioRepository } from '../adapters/api-movimiento-inventario.repository';
import { ListMovimientosUseCase } from '../../application/use-cases/movimiento-inventario/list-movimientos.use-case';
import { CreateMovimientoUseCase } from '../../application/use-cases/movimiento-inventario/create-movimiento.use-case';

const inventoryRepository = new ApiMovimientoInventarioRepository();

export const listMovimientosUseCase = new ListMovimientosUseCase(inventoryRepository);
export const createMovimientoUseCase = new CreateMovimientoUseCase(inventoryRepository);
