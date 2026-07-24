// src/application/use-cases/factura/download-factura-pdf.use-case.ts
import type { FacturaRepository } from '../../../domain/ports/factura.repository';

export class DownloadFacturaPdfUseCase {
  private repository: FacturaRepository;

  constructor(repository: FacturaRepository) {
    this.repository = repository;
  }

  execute(id: number, options?: { inline?: boolean }) {
    return this.repository.downloadFacturaPdf(id, options);
  }
}
