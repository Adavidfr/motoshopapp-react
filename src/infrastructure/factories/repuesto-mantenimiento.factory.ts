import {
  ApiRepuestoMantenimientoRepository,
} from '../adapters/axios-repuesto-mantenimiento.repository';

import {
  GetRepuestosMantenimientoUseCase,
} from '../../application/use-cases/repuesto-mantenimiento/get-repuestos-mantenimiento.use-case';

import {
  GetRepuestoMantenimientoUseCase,
} from '../../application/use-cases/repuesto-mantenimiento/get-repuesto-mantenimiento.use-case';

import {
  GetRepuestoMantenimientoStatsUseCase,
} from '../../application/use-cases/repuesto-mantenimiento/get-repuesto-mantenimiento-stats.use-case';

import {
  CreateRepuestoMantenimientoUseCase,
} from '../../application/use-cases/repuesto-mantenimiento/create-repuesto-mantenimiento.use-case';

import {
  UpdateRepuestoMantenimientoUseCase,
} from '../../application/use-cases/repuesto-mantenimiento/update-repuesto-mantenimiento.use-case';

import {
  DeleteRepuestoMantenimientoUseCase,
} from '../../application/use-cases/repuesto-mantenimiento/delete-repuesto-mantenimiento.use-case';

const repository =
  new ApiRepuestoMantenimientoRepository();

export const getRepuestosMantenimientoUseCase =
  new GetRepuestosMantenimientoUseCase(
    repository,
  );

export const getRepuestoMantenimientoUseCase =
  new GetRepuestoMantenimientoUseCase(
    repository,
  );

export const getRepuestoMantenimientoStatsUseCase =
  new GetRepuestoMantenimientoStatsUseCase(
    repository,
  );

export const createRepuestoMantenimientoUseCase =
  new CreateRepuestoMantenimientoUseCase(
    repository,
  );

export const updateRepuestoMantenimientoUseCase =
  new UpdateRepuestoMantenimientoUseCase(
    repository,
  );

export const deleteRepuestoMantenimientoUseCase =
  new DeleteRepuestoMantenimientoUseCase(
    repository,
  );