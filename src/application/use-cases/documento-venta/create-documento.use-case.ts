// src/application/use-cases/documento-venta/create-documento.use-case.ts
import type { DocumentoVentaRepository } from '../../../domain/ports/documento-venta.repository';
import type { DocumentoVenta } from '../../../domain/entities/documento-venta.entity';
export class CreateDocumentoUseCase {
  constructor(private readonly repository: DocumentoVentaRepository) {}
  execute(payload: Omit<DocumentoVenta, 'id_documento' | 'fecha_subida'>) { return this.repository.createDocumento(payload); }
}
