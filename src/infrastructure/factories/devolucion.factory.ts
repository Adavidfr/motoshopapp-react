// src/infrastructure/factories/devolucion.factory.ts
import { ApiDevolucionRepository } from '../adapters/api-devolucion.repository';
import { GetDevolucionesUseCase } from '../../application/use-cases/devolucion/get-devoluciones.use-case';
import { GetDevolucionUseCase } from '../../application/use-cases/devolucion/get-devolucion.use-case';
import { CreateDevolucionUseCase } from '../../application/use-cases/devolucion/create-devolucion.use-case';
import { GetDevolucionStatsUseCase } from '../../application/use-cases/devolucion/get-devolucion-stats.use-case';
import { AprobarDevolucionUseCase } from '../../application/use-cases/devolucion/aprobar-devolucion.use-case';
import { RechazarDevolucionUseCase } from '../../application/use-cases/devolucion/rechazar-devolucion.use-case';

const devolucionRepository = new ApiDevolucionRepository();

export const getDevolucionesUseCase = new GetDevolucionesUseCase(devolucionRepository);
export const getDevolucionUseCase = new GetDevolucionUseCase(devolucionRepository);
export const createDevolucionUseCase = new CreateDevolucionUseCase(devolucionRepository);
export const getDevolucionStatsUseCase = new GetDevolucionStatsUseCase(devolucionRepository);
export const aprobarDevolucionUseCase = new AprobarDevolucionUseCase(devolucionRepository);
export const rechazarDevolucionUseCase = new RechazarDevolucionUseCase(devolucionRepository);
