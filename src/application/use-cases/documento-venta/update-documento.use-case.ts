// src/application/use-cases/documento-venta/update-documento.use-case.ts
import type { DocumentoVentaRepository } from '../../../domain/ports/documento-venta.repository';
import type { DocumentoVenta } from '../../../domain/entities/documento-venta.entity';
export class UpdateDocumentoUseCase {
  private repository: DocumentoVentaRepository;
  constructor(r: DocumentoVentaRepository) { this.repository = r; }
  execute(id: number, payload: Partial<DocumentoVenta>) { return this.repository.updateDocumento(id, payload); }
}
