// src/infrastructure/factories/financiamiento.factory.ts
import { ApiFinanciamientoRepository } from '../adapters/api-financiamiento.repository';
import { CreateFinanciamientoUseCase } from '../../application/use-cases/financiamiento/create-financiamiento.use-case';
import { GetFinanciamientosUseCase } from '../../application/use-cases/financiamiento/get-financiamientos.use-case';
import { GetFinanciamientoUseCase } from '../../application/use-cases/financiamiento/get-financiamiento.use-case';
import { UpdateFinanciamientoUseCase } from '../../application/use-cases/financiamiento/update-financiamiento.use-case';
import { DeleteFinanciamientoUseCase } from '../../application/use-cases/financiamiento/delete-financiamiento.use-case';
import { GetFinanciamientoStatsUseCase } from '../../application/use-cases/financiamiento/get-financiamiento-stats.use-case';

const financiamientoRepository = new ApiFinanciamientoRepository();

export const createFinanciamientoUseCase = new CreateFinanciamientoUseCase(financiamientoRepository);
export const getFinanciamientosUseCase = new GetFinanciamientosUseCase(financiamientoRepository);
export const getFinanciamientoUseCase = new GetFinanciamientoUseCase(financiamientoRepository);
export const updateFinanciamientoUseCase = new UpdateFinanciamientoUseCase(financiamientoRepository);
export const deleteFinanciamientoUseCase = new DeleteFinanciamientoUseCase(financiamientoRepository);
export const getFinanciamientoStatsUseCase = new GetFinanciamientoStatsUseCase(financiamientoRepository);
