import type { ProveedorRepository } from '../../../domain/ports/proveedor.repository';

export class GetProveedorStatsUseCase {
  private readonly repository: ProveedorRepository;

  constructor(repository: ProveedorRepository) {
    this.repository = repository;
  }

  execute() {
    return this.repository.getStats();
  }
}