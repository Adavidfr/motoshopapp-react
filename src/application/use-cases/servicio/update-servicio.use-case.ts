import type {
  ServicioDto,
} from '../../dtos/servicio.dto';

import type {
  ServicioRepository,
} from '../../../domain/ports/servicio.repository';

export class UpdateServicioUseCase {
  private readonly repository: ServicioRepository;

  constructor(repository: ServicioRepository) {
    this.repository = repository;
  }

  execute(
    id: number,
    dto: Partial<ServicioDto>,
  ) {
    return this.repository.update(id, dto);
  }
}