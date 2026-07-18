import type { ProveedorRepository } from '../../../domain/ports/proveedor.repository';
import type { ProveedorFilters } from '../../dtos/proveedor.dto';

export class GetProveedoresUseCase {
  private readonly repository: ProveedorRepository;

  constructor(repository: ProveedorRepository) {
    this.repository = repository;
  }

  execute(filters?: ProveedorFilters) {
    return this.repository.getAll(filters);
  }
}