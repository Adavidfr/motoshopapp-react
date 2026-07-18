import type {
  ServicioDto,
} from '../../dtos/servicio.dto';

import type {
  ServicioRepository,
} from '../../../domain/ports/servicio.repository';

export class CreateServicioUseCase {
  private readonly repository: ServicioRepository;

  constructor(repository: ServicioRepository) {
    this.repository = repository;
  }

  execute(dto: ServicioDto) {
    return this.repository.create(dto);
  }
}