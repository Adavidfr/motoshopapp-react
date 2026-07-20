import { AxiosServicioRepository } from '../adapters/axios-servicio.repository';

import { GetServiciosUseCase } from '../../application/use-cases/servicio/get-servicios.use-case';
import { GetServicioUseCase } from '../../application/use-cases/servicio/get-servicio.use-case';
import { GetServicioStatsUseCase } from '../../application/use-cases/servicio/get-servicio-stats.use-case';
import { CreateServicioUseCase } from '../../application/use-cases/servicio/create-servicio.use-case';
import { UpdateServicioUseCase } from '../../application/use-cases/servicio/update-servicio.use-case';
import { DeleteServicioUseCase } from '../../application/use-cases/servicio/delete-servicio.use-case';

const servicioRepository =
  new AxiosServicioRepository();

export const getServiciosUseCase =
  new GetServiciosUseCase(servicioRepository);

export const getServicioUseCase =
  new GetServicioUseCase(servicioRepository);

export const getServicioStatsUseCase =
  new GetServicioStatsUseCase(servicioRepository);

export const createServicioUseCase =
  new CreateServicioUseCase(servicioRepository);

export const updateServicioUseCase =
  new UpdateServicioUseCase(servicioRepository);

export const deleteServicioUseCase =
  new DeleteServicioUseCase(servicioRepository);