import type {
  MantenimientoRepository,
} from '../../../domain/ports/mantenimiento.repository';

export class DeleteMantenimientoUseCase {
  private readonly repository:
    MantenimientoRepository;

  constructor(
    repository: MantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}