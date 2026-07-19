// src/application/use-cases/documento-venta/get-documento.use-case.ts
import type { DocumentoVentaRepository } from '../../../domain/ports/documento-venta.repository';
export class GetDocumentoUseCase {
  constructor(private readonly repository: DocumentoVentaRepository) {}
  execute(id: number) { return this.repository.getDocumento(id); }
}
