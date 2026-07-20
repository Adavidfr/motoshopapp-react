// src/presentation/pages/catalog/MotosPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotoStore } from '../../store/moto.store';
import { useBrandStore } from '../../store/brand.store';
import { useCategoryStore } from '../../store/category.store';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import { Search, ArrowRight, Bike, SlidersHorizontal, X } from 'lucide-react';

export default function MotosPage() {
  const { motos, totalCount, fetchMotos, isLoading, error } = useMotoStore();
  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Debounce búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when other filters change
  useEffect(() => {
    setPage(1);
  }, [selectedBrand, selectedCategory, selectedOrder]);

  // Cargar datos auxiliares
  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  // Cargar motos con filtros y página
  useEffect(() => {
    const params: Record<string, string | number> = { page };
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedBrand) params.marca = selectedBrand;
    if (selectedCategory) params.categoria = selectedCategory;
    if (selectedOrder) params.ordering = selectedOrder;
    fetchMotos(params);
  }, [debouncedSearch, selectedBrand, selectedCategory, selectedOrder, page, fetchMotos]);

  const hasFilters = searchTerm || selectedBrand || selectedCategory || selectedOrder;

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedOrder('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Page header */}
      <div className="bg-[#070708] border-b border-neutral-900 py-10">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6">
          <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
            Catálogo completo
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mt-1">
            Nuestras Motos
          </h1>
          <p className="text-neutral-500 text-sm font-medium mt-2">
            Explora toda nuestra colección — {isLoading ? '...' : motos.length} modelos disponibles
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border-b border-neutral-200 shadow-sm sticky top-[80px] z-30">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                placeholder="Buscar modelo o color..."
                className="pl-9 bg-white border-neutral-300 text-neutral-900 rounded-none h-10 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Desktop filters */}
            <div className="hidden md:flex items-center gap-3 flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-neutral-300 text-neutral-700 rounded-none h-10 px-3 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                {categories.filter((c) => c.estado).map((cat) => (
                  <option key={cat.idCategoria} value={cat.idCategoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-white border border-neutral-300 text-neutral-700 rounded-none h-10 px-3 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">Todas las marcas</option>
                {brands.filter((b) => b.estado).map((b) => (
                  <option key={b.idMarca} value={b.idMarca}>
                    {b.nombre}
                  </option>
                ))}
              </select>

              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="bg-white border border-neutral-300 text-neutral-700 rounded-none h-10 px-3 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">Ordenar por</option>
                <option value="precio">Precio: Menor a Mayor</option>
                <option value="-precio">Precio: Mayor a Menor</option>
                <option value="-anio">Año: Más Reciente</option>
                <option value="-stock">Stock: Mayor a Menor</option>
              </select>
            </div>

            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-600 border border-neutral-300 px-3 h-10 hover:border-primary hover:text-primary transition-colors"
            >
              <SlidersHorizontal className="size-3.5" />
              Filtros
            </button>

            {/* Clear filters */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-destructive/80 hover:text-destructive transition-colors ml-auto"
              >
                <X className="size-3" />
                Limpiar
              </button>
            )}

            {/* Results count */}
            <span className="hidden sm:block text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap ml-auto">
              {isLoading ? '...' : `${motos.length} resultado${motos.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Mobile filters panel */}
          {showFilters && (
            <div className="md:hidden flex flex-col gap-2 pt-3 mt-3 border-t border-neutral-100">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-neutral-300 text-neutral-700 rounded-none h-10 px-3 text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="">Todas las categorías</option>
                {categories.filter((c) => c.estado).map((cat) => (
                  <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
                ))}
              </select>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-white border border-neutral-300 text-neutral-700 rounded-none h-10 px-3 text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="">Todas las marcas</option>
                {brands.filter((b) => b.estado).map((b) => (
                  <option key={b.idMarca} value={b.idMarca}>{b.nombre}</option>
                ))}
              </select>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="bg-white border border-neutral-300 text-neutral-700 rounded-none h-10 px-3 text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="">Ordenar por</option>
                <option value="precio">Precio: Menor a Mayor</option>
                <option value="-precio">Precio: Mayor a Menor</option>
                <option value="-anio">Año: Más Reciente</option>
                <option value="-stock">Stock: Mayor a Menor</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Products grid */}
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 py-10">
        {error && (
          <div className="mb-6 p-4 text-sm bg-destructive/10 border border-destructive/20 text-destructive font-semibold">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-white border-neutral-200 rounded-none overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardHeader className="p-5 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Skeleton className="h-6 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : motos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bike className="size-16 text-neutral-300 mb-4" />
            <h2 className="text-xl font-black uppercase text-neutral-700">
              No se encontraron motos
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-xs">
              Prueba ajustando los filtros o limpia la búsqueda para ver todos los modelos.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 text-xs font-bold uppercase tracking-widest text-primary border border-primary/30 px-6 py-2.5 hover:bg-primary/5 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {motos.map((moto) => (
              <Card key={moto.idMoto} className="racing-card rounded-none h-[400px]">
                {/* Imagen */}
                <div className="aspect-video w-full bg-neutral-50 relative overflow-hidden flex items-center justify-center p-4">
                  {moto.imagen ? (
                    <img
                      src={moto.imagen}
                      alt={moto.modelo}
                      className="object-contain w-full h-full hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-5xl">🏍️</span>
                  )}
                  <span
                    className={`absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                      moto.stock > 0
                        ? 'bg-green-500/10 text-green-600 border-green-500/25'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}
                  >
                    {moto.stock > 0 ? 'En Stock' : 'Agotado'}
                  </span>
                </div>

                <CardHeader className="p-5 pb-2">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                    {moto.marca || 'Sport'}
                  </span>
                  <CardTitle className="text-base font-black text-neutral-900 mt-0.5 truncate uppercase">
                    {moto.modelo}
                  </CardTitle>
                  <p className="text-[11px] text-neutral-400 font-bold mt-0.5">
                    {moto.categoria || 'Naked'}
                  </p>
                </CardHeader>

                <CardContent className="px-5 pb-5 pt-0">
                  <p className="text-xl font-extrabold text-neutral-900">{formatPrice(moto.precio)}</p>
                </CardContent>

                <CardFooter className="px-5 py-4 mt-auto flex justify-between items-center border-t border-neutral-100">
                  <Link
                    to={`/products/${moto.idMoto}`}
                    className="w-full flex justify-between items-center group"
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-700 group-hover:text-primary transition-colors">
                      Ver Detalles
                    </span>
                    <ArrowRight className="size-4 text-neutral-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination buttons */}
        {totalCount > 10 && (
          <div className="flex justify-center items-center gap-4 mt-12 pt-6 border-t border-neutral-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-neutral-300 bg-white text-neutral-800 disabled:opacity-50 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-neutral-600">
              Página {page} de {Math.ceil(totalCount / 10)}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(totalCount / 10), p + 1))}
              disabled={page >= Math.ceil(totalCount / 10)}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-neutral-300 bg-white text-neutral-800 disabled:opacity-50 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
