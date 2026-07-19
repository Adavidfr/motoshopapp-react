// src/infrastructure/factories/seguro.factory.ts
import { ApiSeguroRepository } from '../adapters/api-seguro.repository';
import { GetSegurosUseCase } from '../../application/use-cases/seguro/get-seguros.use-case';
import { GetSeguroUseCase } from '../../application/use-cases/seguro/get-seguro.use-case';
import { CreateSeguroUseCase } from '../../application/use-cases/seguro/create-seguro.use-case';
import { UpdateSeguroUseCase } from '../../application/use-cases/seguro/update-seguro.use-case';
import { DeleteSeguroUseCase } from '../../application/use-cases/seguro/delete-seguro.use-case';

const seguroRepository = new ApiSeguroRepository();

export const getSegurosUseCase  = new GetSegurosUseCase(seguroRepository);
export const getSeguroUseCase   = new GetSeguroUseCase(seguroRepository);
export const createSeguroUseCase = new CreateSeguroUseCase(seguroRepository);
export const updateSeguroUseCase = new UpdateSeguroUseCase(seguroRepository);
export const deleteSeguroUseCase = new DeleteSeguroUseCase(seguroRepository);
