import type {
  ServicioFilters,
} from '../../dtos/servicio.dto';

import type {
  ServicioRepository,
} from '../../../domain/ports/servicio.repository';

export class GetServiciosUseCase {
  private readonly repository: ServicioRepository;

  constructor(repository: ServicioRepository) {
    this.repository = repository;
  }

  execute(filters?: ServicioFilters) {
    return this.repository.getAll(filters);
  }
}