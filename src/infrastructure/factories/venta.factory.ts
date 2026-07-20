// src/infrastructure/factories/venta.factory.ts
import { ApiVentaRepository } from '../adapters/api-venta.repository';
import { CreateVentaUseCase } from '../../application/use-cases/venta/create-venta.use-case';
import { GetVentasUseCase } from '../../application/use-cases/venta/get-ventas.use-case';
import { GetVentaUseCase } from '../../application/use-cases/venta/get-venta.use-case';
import { UpdateVentaUseCase } from '../../application/use-cases/venta/update-venta.use-case';
import { DeleteVentaUseCase } from '../../application/use-cases/venta/delete-venta.use-case';
import { GetVentaStatsUseCase } from '../../application/use-cases/venta/get-venta-stats.use-case';
import { FinanciarVentaUseCase } from '../../application/use-cases/venta/financiar-venta.use-case';

const ventaRepository = new ApiVentaRepository();

export const createVentaUseCase = new CreateVentaUseCase(ventaRepository);
export const getVentasUseCase = new GetVentasUseCase(ventaRepository);
export const getVentaUseCase = new GetVentaUseCase(ventaRepository);
export const updateVentaUseCase = new UpdateVentaUseCase(ventaRepository);
export const deleteVentaUseCase = new DeleteVentaUseCase(ventaRepository);
export const getVentaStatsUseCase = new GetVentaStatsUseCase(ventaRepository);
export const financiarVentaUseCase = new FinanciarVentaUseCase(ventaRepository);
