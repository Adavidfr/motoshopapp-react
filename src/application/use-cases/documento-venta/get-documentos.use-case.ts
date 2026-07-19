// src/application/use-cases/documento-venta/get-documentos.use-case.ts
import type { DocumentoVentaRepository, DocumentoVentaFilters } from '../../../domain/ports/documento-venta.repository';
export class GetDocumentosUseCase {
  constructor(private readonly repository: DocumentoVentaRepository) {}
  execute(filters?: DocumentoVentaFilters) { return this.repository.listDocumentos(filters); }
}
