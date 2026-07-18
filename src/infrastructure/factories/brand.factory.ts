// src/infrastructure/factories/brand.factory.ts
import { ApiMarcaRepository } from '../adapters/api-marca.repository';
import { ListBrandsUseCase } from '../../application/use-cases/brand/list-brands.use-case';
import { CreateBrandUseCase } from '../../application/use-cases/brand/create-brand.use-case';
import { UpdateBrandUseCase } from '../../application/use-cases/brand/update-brand.use-case';

const brandRepository = new ApiMarcaRepository();

export const listBrandsUseCase = new ListBrandsUseCase(brandRepository);
export const createBrandUseCase = new CreateBrandUseCase(brandRepository);
export const updateBrandUseCase = new UpdateBrandUseCase(brandRepository);
