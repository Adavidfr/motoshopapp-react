import {
  ApiMantenimientoRepository,
} from '../adapters/axios-mantenimiento.repository';

import {
  GetMantenimientosUseCase,
} from '../../application/use-cases/mantenimiento/get-mantenimientos.use-case';

import {
  GetMantenimientoUseCase,
} from '../../application/use-cases/mantenimiento/get-mantenimiento.use-case';

import {
  GetMantenimientoStatsUseCase,
} from '../../application/use-cases/mantenimiento/get-mantenimiento-stats.use-case';

import {
  CreateMantenimientoUseCase,
} from '../../application/use-cases/mantenimiento/create-mantenimiento.use-case';

import {
  UpdateMantenimientoUseCase,
} from '../../application/use-cases/mantenimiento/update-mantenimiento.use-case';

import {
  DeleteMantenimientoUseCase,
} from '../../application/use-cases/mantenimiento/delete-mantenimiento.use-case';

const repository =
  new ApiMantenimientoRepository();

export const getMantenimientosUseCase =
  new GetMantenimientosUseCase(repository);

export const getMantenimientoUseCase =
  new GetMantenimientoUseCase(repository);

export const getMantenimientoStatsUseCase =
  new GetMantenimientoStatsUseCase(repository);

export const createMantenimientoUseCase =
  new CreateMantenimientoUseCase(repository);

export const updateMantenimientoUseCase =
  new UpdateMantenimientoUseCase(repository);

export const deleteMantenimientoUseCase =
  new DeleteMantenimientoUseCase(repository);