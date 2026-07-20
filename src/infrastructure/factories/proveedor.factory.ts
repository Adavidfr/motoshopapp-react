import { AxiosProveedorRepository } from '../adapters/axios-proveedor.repository';

import { GetProveedoresUseCase } from '../../application/use-cases/proveedor/get-proveedores.use-case';
import { GetProveedorUseCase } from '../../application/use-cases/proveedor/get-proveedor.use-case';
import { GetProveedorStatsUseCase } from '../../application/use-cases/proveedor/get-proveedor-stats.use-case';
import { CreateProveedorUseCase } from '../../application/use-cases/proveedor/create-proveedor.use-case';
import { UpdateProveedorUseCase } from '../../application/use-cases/proveedor/update-proveedor.use-case';
import { DeleteProveedorUseCase } from '../../application/use-cases/proveedor/delete-proveedor.use-case';

const proveedorRepository = new AxiosProveedorRepository();

export const getProveedoresUseCase =
  new GetProveedoresUseCase(proveedorRepository);

export const getProveedorUseCase =
  new GetProveedorUseCase(proveedorRepository);

export const getProveedorStatsUseCase =
  new GetProveedorStatsUseCase(proveedorRepository);

export const createProveedorUseCase =
  new CreateProveedorUseCase(proveedorRepository);

export const updateProveedorUseCase =
  new UpdateProveedorUseCase(proveedorRepository);

export const deleteProveedorUseCase =
  new DeleteProveedorUseCase(proveedorRepository);