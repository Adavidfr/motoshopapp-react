// src/application/use-cases/documento-venta/download-documento.use-case.ts
import type { DocumentoVentaRepository } from '../../../domain/ports/documento-venta.repository';
import type { DocumentoVentaDownload } from '../../../domain/entities/documento-venta.entity';

export class DownloadDocumentoUseCase {
  private documentoRepository: DocumentoVentaRepository;

  constructor(documentoRepository: DocumentoVentaRepository) {
    this.documentoRepository = documentoRepository;
  }

  execute(id: number): Promise<DocumentoVentaDownload> {
    return this.documentoRepository.downloadDocumentoArchivo(id);
  }
}
