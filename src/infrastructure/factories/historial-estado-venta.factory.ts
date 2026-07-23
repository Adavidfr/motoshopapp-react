// src/infrastructure/factories/historial-estado-venta.factory.ts
import { ApiHistorialEstadoVentaRepository } from '../adapters/api-historial-estado-venta.repository';
import { GetHistorialesUseCase } from '../../application/use-cases/historial-estado-venta/get-historiales.use-case';
import { GetHistorialUseCase } from '../../application/use-cases/historial-estado-venta/get-historial.use-case';

const historialRepository = new ApiHistorialEstadoVentaRepository();

export const getHistorialesUseCase = new GetHistorialesUseCase(historialRepository);
export const getHistorialUseCase = new GetHistorialUseCase(historialRepository);
