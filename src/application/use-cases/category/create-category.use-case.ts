// src/application/use-cases/category/create-category.use-case.ts
import type { CategoriaRepository } from '../../../domain/ports/categoria.repository';
import type { CategoriaMoto } from '../../../domain/entities/categoria.entity';

export class CreateCategoryUseCase {
  private categoryRepository: CategoriaRepository;
  constructor(categoryRepository: CategoriaRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(categoria: Omit<CategoriaMoto, 'idCategoria'>): Promise<CategoriaMoto> {
    return this.categoryRepository.createCategoria(categoria);
  }
}
