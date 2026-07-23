// src/infrastructure/factories/repuesto.factory.ts
import { ApiRepuestoRepository } from '../adapters/api-repuesto.repository';
import { ListRepuestosUseCase } from '../../application/use-cases/repuesto/list-repuestos.use-case';
import { GetRepuestoUseCase } from '../../application/use-cases/repuesto/get-repuesto.use-case';
import { CreateRepuestoUseCase } from '../../application/use-cases/repuesto/create-repuesto.use-case';
import { UpdateRepuestoUseCase } from '../../application/use-cases/repuesto/update-repuesto.use-case';
import { DeleteRepuestoUseCase } from '../../application/use-cases/repuesto/delete-repuesto.use-case';

const repuestoRepository = new ApiRepuestoRepository();

export const listRepuestosUseCase = new ListRepuestosUseCase(repuestoRepository);
export const getRepuestoUseCase = new GetRepuestoUseCase(repuestoRepository);
export const createRepuestoUseCase = new CreateRepuestoUseCase(repuestoRepository);
export const updateRepuestoUseCase = new UpdateRepuestoUseCase(repuestoRepository);
export const deleteRepuestoUseCase = new DeleteRepuestoUseCase(repuestoRepository);
