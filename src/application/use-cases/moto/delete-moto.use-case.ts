// src/application/use-cases/moto/delete-moto.use-case.ts
import type { MotoRepository } from '../../../domain/ports/moto.repository';

export class DeleteMotoUseCase {
  private motoRepository: MotoRepository;
  constructor(motoRepository: MotoRepository) {
    this.motoRepository = motoRepository;
  }

  async execute(id: number): Promise<void> {
    return this.motoRepository.deleteMoto(id);
  }
}
