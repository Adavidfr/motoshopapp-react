import type {
  ServicioRepository,
} from '../../../domain/ports/servicio.repository';

export class GetServicioStatsUseCase {
  private readonly repository: ServicioRepository;

  constructor(repository: ServicioRepository) {
    this.repository = repository;
  }

  execute() {
    return this.repository.getStats();
  }
}