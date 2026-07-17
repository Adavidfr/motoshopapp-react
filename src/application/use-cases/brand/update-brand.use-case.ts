// src/application/use-cases/brand/update-brand.use-case.ts
import type { MarcaRepository } from '../../../domain/ports/marca.repository';
import type { Marca } from '../../../domain/entities/marca.entity';

export class UpdateBrandUseCase {
  private brandRepository: MarcaRepository;
  constructor(brandRepository: MarcaRepository) {
    this.brandRepository = brandRepository;
  }

  async execute(id: number, brand: Partial<Marca>): Promise<Marca> {
    return this.brandRepository.updateMarca(id, brand);
  }
}
