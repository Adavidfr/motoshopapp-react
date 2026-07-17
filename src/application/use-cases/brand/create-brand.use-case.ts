// src/application/use-cases/brand/create-brand.use-case.ts
import type { MarcaRepository } from '../../../domain/ports/marca.repository';
import type { Marca } from '../../../domain/entities/marca.entity';

export class CreateBrandUseCase {
  private brandRepository: MarcaRepository;
  constructor(brandRepository: MarcaRepository) {
    this.brandRepository = brandRepository;
  }

  async execute(marca: Omit<Marca, 'idMarca'>): Promise<Marca> {
    return this.brandRepository.createMarca(marca);
  }
}
