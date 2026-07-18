// src/application/use-cases/moto/create-moto.use-case.ts
import type { MotoRepository } from '../../../domain/ports/moto.repository';
import type { Moto } from '../../../domain/entities/moto.entity';

export class CreateMotoUseCase {
  private motoRepository: MotoRepository;
  constructor(motoRepository: MotoRepository) {
    this.motoRepository = motoRepository;
  }

  async execute(formData: FormData): Promise<Moto> {
    return this.motoRepository.createMoto(formData);
  }
}
