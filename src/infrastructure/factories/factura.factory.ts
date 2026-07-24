// src/infrastructure/factories/factura.factory.ts
import { ApiFacturaRepository } from '../adapters/api-factura.repository';
import { GetFacturasUseCase } from '../../application/use-cases/factura/get-facturas.use-case';
import { GetFacturaUseCase } from '../../application/use-cases/factura/get-factura.use-case';
import { CreateFacturaUseCase } from '../../application/use-cases/factura/create-factura.use-case';
import { DownloadFacturaPdfUseCase } from '../../application/use-cases/factura/download-factura-pdf.use-case';

const facturaRepository = new ApiFacturaRepository();

export const getFacturasUseCase = new GetFacturasUseCase(facturaRepository);
export const getFacturaUseCase = new GetFacturaUseCase(facturaRepository);
export const createFacturaUseCase = new CreateFacturaUseCase(facturaRepository);
export const downloadFacturaPdfUseCase = new DownloadFacturaPdfUseCase(facturaRepository);
