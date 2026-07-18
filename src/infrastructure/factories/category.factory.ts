// src/infrastructure/factories/category.factory.ts
import { ApiCategoriaRepository } from '../adapters/api-categoria.repository';
import { ListCategoriesUseCase } from '../../application/use-cases/category/list-categories.use-case';
import { CreateCategoryUseCase } from '../../application/use-cases/category/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/category/update-category.use-case';

const categoryRepository = new ApiCategoriaRepository();

export const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);
export const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
export const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
