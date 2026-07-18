import type {
  RepuestoMantenimientoRepository,
} from '../../../domain/ports/repuesto-mantenimiento.repository';

export class DeleteRepuestoMantenimientoUseCase {
  private readonly repository:
    RepuestoMantenimientoRepository;

  constructor(
    repository: RepuestoMantenimientoRepository,
  ) {
    this.repository = repository;
  }

  execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}