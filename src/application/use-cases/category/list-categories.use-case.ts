// src/application/use-cases/category/list-categories.use-case.ts
import type { CategoriaRepository } from '../../../domain/ports/categoria.repository';
import type { CategoriaMoto } from '../../../domain/entities/categoria.entity';

export class ListCategoriesUseCase {
  private categoryRepository: CategoriaRepository;
  constructor(categoryRepository: CategoriaRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(): Promise<CategoriaMoto[]> {
    return this.categoryRepository.getCategorias();
  }
}
