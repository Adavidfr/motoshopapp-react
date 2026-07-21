// src/presentation/pages/catalog/MotosPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotoStore } from '../../store/moto.store';
import { useBrandStore } from '../../store/brand.store';
import { useCategoryStore } from '../../store/category.store';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Page header */}
      <div className="bg-neutral-100 dark:bg-[#070708] border-b border-neutral-200 dark:border-neutral-900 py-10 transition-colors duration-300">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6">
          <span className="text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
            Catálogo completo
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            Nuestras Motos
          </h1>
          <p className="text-neutral-500 text-sm font-medium mt-2">
            Explora toda nuestra colección
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-card border-b border-border shadow-sm sticky top-[80px] z-30 transition-colors duration-300">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                placeholder="Buscar modelo o color..."
                className="pl-9 bg-card border-border text-card-foreground rounded-none h-10 text-xs focus-visible:ring-1 focus-visible:ring-primary"
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
                className="bg-card border border-border text-card-foreground rounded-none h-10 px-3 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
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
                className="bg-card border border-border text-card-foreground rounded-none h-10 px-3 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
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
                className="bg-card border border-border text-card-foreground rounded-none h-10 px-3 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
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
              <Card key={moto.idMoto} className="glass-panel h-[480px] overflow-hidden group flex flex-col justify-between rounded-[2.5rem] hover:shadow-[0_20px_50px_rgba(255,26,26,0.2)] hover:-translate-y-2 transition-all duration-700 ease-out border border-white/5 relative bg-neutral-100/50 dark:bg-black/40">
                {/* Ambient card glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Image Container - Showroom Style */}
                <div className="h-[55%] w-full relative overflow-hidden flex items-center justify-center p-6 bg-white dark:bg-neutral-100 rounded-b-[2.5rem] shadow-[inset_0_-15px_30px_rgba(0,0,0,0.05)] z-10 transition-colors duration-500">
                  {/* Pedestal Shadow */}
                  <div className="absolute bottom-4 w-3/4 h-4 bg-black/20 blur-xl rounded-full scale-y-50" />
                  
                  {moto.imagen ? (
                    <img
                      src={moto.imagen}
                      alt={moto.modelo}
                      className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 group-hover:-rotate-3 group-hover:-translate-y-2 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10"
                    />
                  ) : (
                    <span className="text-6xl drop-shadow-2xl relative z-10">🏍️</span>
                  )}
                  
                  {/* Premium Stock Badge */}
                  <div className={`absolute top-5 right-5 text-[9px] font-black uppercase px-4 py-2 rounded-2xl tracking-widest backdrop-blur-xl border shadow-lg z-20 ${
                    moto.stock > 0
                      ? 'bg-green-500/10 text-green-700 dark:text-green-600 border-green-500/30 shadow-green-500/20'
                      : 'bg-red-500/10 text-red-700 dark:text-red-600 border-red-500/30 shadow-red-500/20'
                  }`}>
                    {moto.stock > 0 ? 'En Stock' : 'Agotado'}
                  </div>
                  
                  {/* Floating Brand Tag */}
                  <div className="absolute top-5 left-5 z-20">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl">
                      {moto.marca || 'Sport'}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 flex flex-col p-8 z-10 relative">
                  <div className="mb-auto">
                    <CardTitle className="text-2xl font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors duration-300 drop-shadow-sm">
                      {moto.modelo}
                    </CardTitle>
                    <p className="text-[11px] text-neutral-500 font-black mt-2 uppercase tracking-[0.2em]">
                      {moto.categoria || 'Naked'}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-end justify-between pt-6 mt-4 relative">
                    {/* Accent line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-neutral-200 dark:from-white/10 to-transparent" />
                    
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Precio base</p>
                      <p className="text-3xl font-black text-foreground tracking-tighter group-hover:drop-shadow-[0_0_15px_rgba(255,26,26,0.4)] transition-all duration-300">
                        {formatPrice(moto.precio)}
                      </p>
                    </div>
                    
                    {/* Animated Arrow Button */}
                    <Link to={`/products/${moto.idMoto}`} className="relative size-12 rounded-full bg-neutral-200 dark:bg-white/5 group-hover:bg-primary text-foreground group-hover:text-white flex items-center justify-center border border-neutral-300 dark:border-white/10 group-hover:border-primary transition-all duration-500 overflow-hidden shadow-lg group-hover:shadow-[0_0_20px_rgba(255,26,26,0.6)]">
                      <ArrowRight className="size-5 -rotate-45 group-hover:rotate-0 transition-transform duration-500 relative z-10" />
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shiny-slide_1s_ease-in-out_infinite]" />
                    </Link>
                  </div>
                </div>
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
