// src/application/use-cases/documento-venta/get-documentos.use-case.ts
import type { DocumentoVentaRepository, DocumentoVentaFilters } from '../../../domain/ports/documento-venta.repository';
export class GetDocumentosUseCase {
  private repository: DocumentoVentaRepository;
  constructor(r: DocumentoVentaRepository) { this.repository = r; }
  execute(filters?: DocumentoVentaFilters) { return this.repository.listDocumentos(filters); }
}
