// src/application/use-cases/moto/list-motos.use-case.ts
import type { MotoRepository, ListMotosParams, PaginatedResult } from '../../../domain/ports/moto.repository';
import type { Moto } from '../../../domain/entities/moto.entity';

export class ListMotosUseCase {
  private motoRepository: MotoRepository;
  constructor(motoRepository: MotoRepository) {
    this.motoRepository = motoRepository;
  }

  async execute(params?: ListMotosParams): Promise<PaginatedResult<Moto>> {
    return this.motoRepository.listMotos(params);
  }
}
