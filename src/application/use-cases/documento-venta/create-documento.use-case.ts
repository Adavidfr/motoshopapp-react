// src/application/use-cases/documento-venta/create-documento.use-case.ts
import type { DocumentoVentaRepository } from '../../../domain/ports/documento-venta.repository';
import type { DocumentoVenta, DocumentoVentaCreatePayload } from '../../../domain/entities/documento-venta.entity';

export class CreateDocumentoUseCase {
  private documentoRepository: DocumentoVentaRepository;

  constructor(documentoRepository: DocumentoVentaRepository) {
    this.documentoRepository = documentoRepository;
  }

  execute(payload: DocumentoVentaCreatePayload): Promise<DocumentoVenta> {
    return this.documentoRepository.createDocumento(payload);
  }
}
