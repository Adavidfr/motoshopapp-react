import { AxiosCompraRepository } from '../adapters/axios-compra.repository';

import { GetComprasUseCase } from '../../application/use-cases/compra/get-compras.use-case';
import { GetCompraUseCase } from '../../application/use-cases/compra/get-compra.use-case';
import { GetCompraStatsUseCase } from '../../application/use-cases/compra/get-compra-stats.use-case';
import { CreateCompraUseCase } from '../../application/use-cases/compra/create-compra.use-case';
import { UpdateCompraUseCase } from '../../application/use-cases/compra/update-compra.use-case';
import { DeleteCompraUseCase } from '../../application/use-cases/compra/delete-compra.use-case';

const compraRepository =
  new AxiosCompraRepository();

export const getComprasUseCase =
  new GetComprasUseCase(compraRepository);

export const getCompraUseCase =
  new GetCompraUseCase(compraRepository);

export const getCompraStatsUseCase =
  new GetCompraStatsUseCase(compraRepository);

export const createCompraUseCase =
  new CreateCompraUseCase(compraRepository);

export const updateCompraUseCase =
  new UpdateCompraUseCase(compraRepository);

export const deleteCompraUseCase =
  new DeleteCompraUseCase(compraRepository);