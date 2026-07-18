// src/infrastructure/factories/moto.factory.ts
import { ApiMotoRepository } from '../adapters/api-moto.repository';
import { ListMotosUseCase } from '../../application/use-cases/moto/list-motos.use-case';
import { GetMotoUseCase } from '../../application/use-cases/moto/get-moto.use-case';
import { CreateMotoUseCase } from '../../application/use-cases/moto/create-moto.use-case';
import { UpdateMotoUseCase } from '../../application/use-cases/moto/update-moto.use-case';
import { DeleteMotoUseCase } from '../../application/use-cases/moto/delete-moto.use-case';

const motoRepository = new ApiMotoRepository();

export const listMotosUseCase = new ListMotosUseCase(motoRepository);
export const getMotoUseCase = new GetMotoUseCase(motoRepository);
export const createMotoUseCase = new CreateMotoUseCase(motoRepository);
export const updateMotoUseCase = new UpdateMotoUseCase(motoRepository);
export const deleteMotoUseCase = new DeleteMotoUseCase(motoRepository);
