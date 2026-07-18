// src/domain/ports/categoria.repository.ts
import type { CategoriaMoto } from '../entities/categoria.entity';

export interface CategoriaRepository {
  getCategorias(): Promise<CategoriaMoto[]>;
  createCategoria(categoria: Omit<CategoriaMoto, 'idCategoria'>): Promise<CategoriaMoto>;
  updateCategoria(id: number, categoria: Partial<CategoriaMoto>): Promise<CategoriaMoto>;
}
