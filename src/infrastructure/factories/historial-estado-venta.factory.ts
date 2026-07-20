// src/infrastructure/factories/historial-estado-venta.factory.ts
import { ApiHistorialEstadoVentaRepository } from '../adapters/api-historial-estado-venta.repository';
import { GetHistorialesUseCase } from '../../application/use-cases/historial-estado-venta/get-historiales.use-case';
import { GetHistorialUseCase } from '../../application/use-cases/historial-estado-venta/get-historial.use-case';
import { CreateHistorialUseCase } from '../../application/use-cases/historial-estado-venta/create-historial.use-case';
import { UpdateHistorialUseCase } from '../../application/use-cases/historial-estado-venta/update-historial.use-case';
import { DeleteHistorialUseCase } from '../../application/use-cases/historial-estado-venta/delete-historial.use-case';

const historialRepository = new ApiHistorialEstadoVentaRepository();

export const getHistorialesUseCase  = new GetHistorialesUseCase(historialRepository);
export const getHistorialUseCase   = new GetHistorialUseCase(historialRepository);
export const createHistorialUseCase = new CreateHistorialUseCase(historialRepository);
export const updateHistorialUseCase = new UpdateHistorialUseCase(historialRepository);
export const deleteHistorialUseCase = new DeleteHistorialUseCase(historialRepository);
