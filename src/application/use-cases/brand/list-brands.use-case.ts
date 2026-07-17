// src/application/use-cases/brand/list-brands.use-case.ts
import type { MarcaRepository } from '../../../domain/ports/marca.repository';
import type { Marca } from '../../../domain/entities/marca.entity';

export class ListBrandsUseCase {
  private brandRepository: MarcaRepository;
  constructor(brandRepository: MarcaRepository) {
    this.brandRepository = brandRepository;
  }

  async execute(): Promise<Marca[]> {
    return this.brandRepository.getMarcas();
  }
}
