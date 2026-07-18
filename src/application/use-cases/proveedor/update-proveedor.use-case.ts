import type { ProveedorRepository } from '../../../domain/ports/proveedor.repository';
import type { ProveedorDto } from '../../dtos/proveedor.dto';

export class UpdateProveedorUseCase {
  private readonly repository: ProveedorRepository;

  constructor(repository: ProveedorRepository) {
    this.repository = repository;
  }

  execute(id: number, dto: Partial<ProveedorDto>) {
    return this.repository.update(id, dto);
  }
}