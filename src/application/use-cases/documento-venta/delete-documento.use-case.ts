// src/application/use-cases/documento-venta/delete-documento.use-case.ts
import type { DocumentoVentaRepository } from '../../../domain/ports/documento-venta.repository';
export class DeleteDocumentoUseCase {
  private repository: DocumentoVentaRepository;
  constructor(r: DocumentoVentaRepository) { this.repository = r; }
  execute(id: number) { return this.repository.deleteDocumento(id); }
}
