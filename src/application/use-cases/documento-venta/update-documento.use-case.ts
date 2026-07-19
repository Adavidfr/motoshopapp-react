// src/application/use-cases/documento-venta/update-documento.use-case.ts
import type { DocumentoVentaRepository } from '../../../domain/ports/documento-venta.repository';
import type { DocumentoVenta } from '../../../domain/entities/documento-venta.entity';
export class UpdateDocumentoUseCase {
  constructor(private readonly repository: DocumentoVentaRepository) {}
  execute(id: number, payload: Partial<DocumentoVenta>) { return this.repository.updateDocumento(id, payload); }
}
