import type { ProveedorRepository } from '../../../domain/ports/proveedor.repository';

export class DeleteProveedorUseCase {
  private readonly repository: ProveedorRepository;

  constructor(repository: ProveedorRepository) {
    this.repository = repository;
  }

  execute(id: number) {
    return this.repository.delete(id);
  }
}