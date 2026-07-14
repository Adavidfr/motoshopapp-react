// src/infrastructure/factories/moto.factory.ts
import { ApiMotoRepository } from '../adapters/api-moto.repository';
import { ListMotosUseCase } from '../../application/use-cases/moto/list-motos.use-case';
import { GetMotoUseCase } from '../../application/use-cases/moto/get-moto.use-case';

const motoRepository = new ApiMotoRepository();

export const listMotosUseCase = new ListMotosUseCase(motoRepository);
export const getMotoUseCase = new GetMotoUseCase(motoRepository);
