// src/presentation/pages/catalog/MotosPage.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useMotoStore } from '../../store/moto.store';
import { useBrandStore } from '../../store/brand.store';
import { useCategoryStore } from '../../store/category.store';
import { Skeleton } from '../../components/ui/skeleton';
import { Bike } from 'lucide-react';
import CatalogFiltersPanel from '../../components/CatalogFiltersPanel';
import MotoCard from '../../components/MotoCard';
import {
  getCatalogGalleryImages,
} from '../../utils/catalog-gallery';

const GALLERY = getCatalogGalleryImages();

export default function MotosPage() {
  const { motos, totalCount, fetchMotos, isLoading, error } = useMotoStore();
  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [selectedBrand, selectedCategory, selectedOrder]);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  useEffect(() => {
    const params: Record<string, string | number> = { page };
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedBrand) params.marca = selectedBrand;
    if (selectedCategory) params.categoria = selectedCategory;
    if (selectedOrder) params.ordering = selectedOrder;
    fetchMotos(params);
  }, [debouncedSearch, selectedBrand, selectedCategory, selectedOrder, page, fetchMotos]);

  const hasFilters = Boolean(searchTerm || selectedBrand || selectedCategory || selectedOrder);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedOrder('');
    setPage(1);
  };

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const categoryOptions = categories
    .filter((c) => c.estado)
    .map((c) => ({ value: c.idCategoria, label: c.nombre }));

  const brandOptions = brands
    .filter((b) => b.estado)
    .map((b) => ({ value: b.idMarca, label: b.nombre }));

  const orderOptions = [
    { value: '', label: 'Relevancia' },
    { value: 'precio', label: 'Precio: menor a mayor' },
    { value: '-precio', label: 'Precio: mayor a menor' },
    { value: '-anio', label: 'Año más reciente' },
    { value: '-stock', label: 'Disponibilidad' },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="relative overflow-hidden border-b border-white/[0.05]">
        <div className="absolute inset-0">
          <img
            src={GALLERY[0]}
            alt=""
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-[#080808]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/50" />
        </div>

        <div className="relative container mx-auto max-w-screen-2xl px-6 lg:px-14 py-24 lg:py-32">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Catálogo</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight max-w-2xl leading-tight">
            Todas las motos
          </h1>
          <p className="mt-5 text-base text-white/65 max-w-md leading-relaxed">
            Encuentra el modelo que buscas por marca, categoría o precio.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-2xl px-6 lg:px-14 py-12 lg:py-16 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            {isLoading ? 'Cargando…' : `${totalCount || motos.length} modelos`}
          </p>
        </div>

        <CatalogFiltersPanel
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedOrder={selectedOrder}
          onOrderChange={setSelectedOrder}
          categories={categoryOptions}
          brands={brandOptions}
          orderOptions={orderOptions}
          hasFilters={hasFilters}
          onClear={clearFilters}
        />

        {error && (
          <div className="p-4 text-sm bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[16/10] w-full bg-white/5" />
            ))}
          </div>
        ) : motos.length === 0 ? (
          <div className="py-28 text-center space-y-4">
            <Bike className="size-10 text-white/20 mx-auto" />
            <h2 className="text-2xl font-semibold text-white/90">No hay resultados</h2>
            <p className="text-base text-white/50">Prueba otros filtros o limpia la búsqueda.</p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="premium-btn mt-4">
                Limpiar
              </button>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
            variants={gridVariants}
            initial="hidden"
            animate="show"
          >
            {motos.map((moto, index) => (
              <MotoCard
                key={moto.idMoto}
                moto={moto}
                index={index}
                variants={itemVariants}
              />
            ))}
          </motion.div>
        )}

        {totalCount > 10 && (
          <div className="flex justify-center items-center gap-6 pt-8">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-white/50 disabled:opacity-30 hover:text-primary transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-white/35">
              {page} / {Math.ceil(totalCount / 10)}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(Math.ceil(totalCount / 10), p + 1))}
              disabled={page >= Math.ceil(totalCount / 10)}
              className="text-sm text-white/50 disabled:opacity-30 hover:text-primary transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
