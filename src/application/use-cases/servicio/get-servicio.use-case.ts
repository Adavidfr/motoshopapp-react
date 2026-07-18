import type {
  ServicioRepository,
} from '../../../domain/ports/servicio.repository';

export class GetServicioUseCase {
  private readonly repository: ServicioRepository;

  constructor(repository: ServicioRepository) {
    this.repository = repository;
  }

  execute(id: number) {
    return this.repository.getById(id);
  }
}