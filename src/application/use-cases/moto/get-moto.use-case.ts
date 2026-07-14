// src/application/use-cases/moto/get-moto.use-case.ts
import type { MotoRepository } from '../../../domain/ports/moto.repository';
import type { Moto } from '../../../domain/entities/moto.entity';

export class GetMotoUseCase {
  private motoRepository: MotoRepository;
  constructor(motoRepository: MotoRepository) {
    this.motoRepository = motoRepository;
  }

  async execute(id: number): Promise<Moto> {
    return this.motoRepository.getMoto(id);
  }
}
