// src/infrastructure/factories/pago.factory.ts
import { ApiPagoRepository } from '../adapters/api-pago.repository';
import { CreatePagoUseCase } from '../../application/use-cases/pago/create-pago.use-case';
import { GetPagosUseCase } from '../../application/use-cases/pago/get-pagos.use-case';
import { GetPagoUseCase } from '../../application/use-cases/pago/get-pago.use-case';
import { GetPagoStatsUseCase } from '../../application/use-cases/pago/get-pago-stats.use-case';

const pagoRepository = new ApiPagoRepository();

export const createPagoUseCase = new CreatePagoUseCase(pagoRepository);
export const getPagosUseCase = new GetPagosUseCase(pagoRepository);
export const getPagoUseCase = new GetPagoUseCase(pagoRepository);
export const getPagoStatsUseCase = new GetPagoStatsUseCase(pagoRepository);
