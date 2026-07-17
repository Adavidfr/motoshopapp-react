// src/application/use-cases/category/update-category.use-case.ts
import type { CategoriaRepository } from '../../../domain/ports/categoria.repository';
import type { CategoriaMoto } from '../../../domain/entities/categoria.entity';

export class UpdateCategoryUseCase {
  private categoryRepository: CategoriaRepository;
  constructor(categoryRepository: CategoriaRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id: number, category: Partial<CategoriaMoto>): Promise<CategoriaMoto> {
    return this.categoryRepository.updateCategoria(id, category);
  }
}
