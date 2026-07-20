// src/infrastructure/factories/garantia.factory.ts
import { ApiGarantiaRepository } from '../adapters/api-garantia.repository';
import { GetGarantiasUseCase } from '../../application/use-cases/garantia/get-garantias.use-case';
import { GetGarantiaUseCase } from '../../application/use-cases/garantia/get-garantia.use-case';
import { CreateGarantiaUseCase } from '../../application/use-cases/garantia/create-garantia.use-case';
import { UpdateGarantiaUseCase } from '../../application/use-cases/garantia/update-garantia.use-case';
import { DeleteGarantiaUseCase } from '../../application/use-cases/garantia/delete-garantia.use-case';

const garantiaRepository = new ApiGarantiaRepository();

export const getGarantiasUseCase  = new GetGarantiasUseCase(garantiaRepository);
export const getGarantiaUseCase   = new GetGarantiaUseCase(garantiaRepository);
export const createGarantiaUseCase = new CreateGarantiaUseCase(garantiaRepository);
export const updateGarantiaUseCase = new UpdateGarantiaUseCase(garantiaRepository);
export const deleteGarantiaUseCase = new DeleteGarantiaUseCase(garantiaRepository);
