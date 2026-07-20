// src/infrastructure/factories/documento-venta.factory.ts
import { ApiDocumentoVentaRepository } from '../adapters/api-documento-venta.repository';
import { GetDocumentosUseCase } from '../../application/use-cases/documento-venta/get-documentos.use-case';
import { GetDocumentoUseCase } from '../../application/use-cases/documento-venta/get-documento.use-case';
import { CreateDocumentoUseCase } from '../../application/use-cases/documento-venta/create-documento.use-case';
import { UpdateDocumentoUseCase } from '../../application/use-cases/documento-venta/update-documento.use-case';
import { DeleteDocumentoUseCase } from '../../application/use-cases/documento-venta/delete-documento.use-case';

const documentoVentaRepository = new ApiDocumentoVentaRepository();

export const getDocumentosUseCase  = new GetDocumentosUseCase(documentoVentaRepository);
export const getDocumentoUseCase   = new GetDocumentoUseCase(documentoVentaRepository);
export const createDocumentoUseCase = new CreateDocumentoUseCase(documentoVentaRepository);
export const updateDocumentoUseCase = new UpdateDocumentoUseCase(documentoVentaRepository);
export const deleteDocumentoUseCase = new DeleteDocumentoUseCase(documentoVentaRepository);
