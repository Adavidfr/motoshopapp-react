// src/application/use-cases/moto/update-moto.use-case.ts
import type { MotoRepository } from '../../../domain/ports/moto.repository';
import type { Moto } from '../../../domain/entities/moto.entity';

export class UpdateMotoUseCase {
  private motoRepository: MotoRepository;
  constructor(motoRepository: MotoRepository) {
    this.motoRepository = motoRepository;
  }

  async execute(id: number, formData: FormData): Promise<Moto> {
    return this.motoRepository.updateMoto(id, formData);
  }
}
