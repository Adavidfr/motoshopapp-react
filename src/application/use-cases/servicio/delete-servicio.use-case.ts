import type {
  ServicioRepository,
} from '../../../domain/ports/servicio.repository';

export class DeleteServicioUseCase {
  private readonly repository: ServicioRepository;

  constructor(repository: ServicioRepository) {
    this.repository = repository;
  }

  execute(id: number) {
    return this.repository.delete(id);
  }
}