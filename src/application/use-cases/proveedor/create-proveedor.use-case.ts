import type { ProveedorRepository } from '../../../domain/ports/proveedor.repository';
import type { ProveedorDto } from '../../dtos/proveedor.dto';

export class CreateProveedorUseCase {
  private readonly repository: ProveedorRepository;

  constructor(repository: ProveedorRepository) {
    this.repository = repository;
  }

  execute(dto: ProveedorDto) {
    return this.repository.create(dto);
  }
}