// src/presentation/pages/catalog/CatalogPage.tsx
import { useEffect, useState } from 'react';
import { useMotoStore } from '../../store/moto.store';
import { Skeleton } from '../../components/ui/skeleton';
import { ArrowRight, ChevronRight, ShieldCheck, BadgeCheck, Headset, CreditCard, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

import { useBrandStore } from '../../store/brand.store';
import { useCategoryStore } from '../../store/category.store';
import HeroVideoCarousel from '../../components/HeroVideoCarousel';
import BrandTicker from '../../components/react-bits/BrandTicker';
import CatalogFiltersPanel from '../../components/CatalogFiltersPanel';
import TrustHighlights from '../../components/TrustHighlights';
import PurchaseJourney from '../../components/PurchaseJourney';
import MotoCard from '../../components/MotoCard';
import type { ListMotosParams } from '../../../domain/ports/moto.repository';

/** Imagen principal de la sección Catálogo (una sola, cinematográfica). */
const COLLECTION_IMAGE = '/motos/imagen1.png';
/** Imagen de la sección Por qué elegirnos. */
const WHY_US_IMAGE = '/motos/Suzuki-Katana-2019-5.jpg';

export default function CatalogPage() {
  const { motos, fetchMotos, isLoading } = useMotoStore();
  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 550);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  useEffect(() => {
    const params: ListMotosParams = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedBrand) params.marca = Number(selectedBrand);
    if (selectedCategory) params.categoria = Number(selectedCategory);
    if (selectedOrder) params.ordering = selectedOrder;
    fetchMotos(params);
  }, [debouncedSearch, selectedBrand, selectedCategory, selectedOrder, fetchMotos]);

  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 36 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const scrollToCatalog = () => {
    document.getElementById('motos-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasFilters = Boolean(
    searchTerm || selectedBrand || selectedCategory || selectedOrder,
  );

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedOrder('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-white">
      {/* HERO */}
      <section className="relative w-full min-h-[94vh] flex items-center overflow-hidden">
        <HeroVideoCarousel />

        <div className="container mx-auto max-w-screen-2xl px-6 lg:px-14 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 py-32">
          <motion.div
            className="lg:col-span-7 flex flex-col justify-center space-y-7"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[0.95] font-semibold tracking-tight text-white max-w-3xl">
              Encuentra tu próxima{' '}
              <span className="text-primary">moto</span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-white/70 max-w-lg leading-relaxed">
              Modelos nuevos, precios claros y asesoría para que compres con seguridad.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <button type="button" onClick={scrollToCatalog} className="premium-btn">
                Ver motos
              </button>
              <a href="#filosofia" className="premium-btn-ghost text-sm">
                Por qué comprarnos
                <ChevronRight className="size-4 text-primary" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/[0.05] bg-[#080808]">
        <BrandTicker speed={32} />
      </section>

      {/* ── CATÁLOGO EDITORIAL + BARRA DE BENEFICIOS/MARCAS ── */}
      <section id="coleccion" className="border-b border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <motion.div
            className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-16 py-12 lg:py-16 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Catálogo
            </p>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-semibold tracking-tight leading-[1.05] text-white max-w-md">
              El lujo también{' '}
              <span className="text-primary italic">acelera.</span>
            </h2>
            <p className="text-base text-white/60 leading-relaxed max-w-md">
              Modelos seleccionados, stock real y precios claros. Compara, elige y da el
              siguiente paso con respaldo.
            </p>
            <a
              href="#motos-list"
              onClick={(e) => {
                e.preventDefault();
                scrollToCatalog();
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white hover:text-primary transition-colors duration-300 pt-1"
            >
              Explorar colección
              <ArrowRight className="size-4 text-primary" />
            </a>
          </motion.div>

          <motion.div
            className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] lg:min-h-[480px] overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={COLLECTION_IMAGE}
              alt="Catálogo Aura Rider"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />
          </motion.div>
        </div>

        {/* Franja beneficios */}
        <div className="border-t border-white/[0.06]">
          <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <TrustHighlights
              items={[
                {
                  icon: ShieldCheck,
                  title: 'Garantía oficial',
                  hint: 'Respaldo directo de cada marca.',
                },
                {
                  icon: BadgeCheck,
                  title: 'Stock verificado',
                  hint: 'Disponibilidad real y actualizada.',
                },
                {
                  icon: Headset,
                  title: 'Asesoría experta',
                  hint: 'Te acompañamos en todo el proceso.',
                },
                {
                  icon: CreditCard,
                  title: 'Financiamiento',
                  hint: 'Planes flexibles a tu medida.',
                },
                {
                  icon: MapPin,
                  title: 'Cobertura nacional',
                  hint: 'Enviamos a todo el país.',
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── POR QUÉ AURA RIDER — banda cinematográfica ── */}
      <section id="filosofia" className="relative border-b border-white/[0.05] overflow-hidden">
        <div className="relative min-h-[500px] lg:min-h-[540px]">
          <motion.img
            src={WHY_US_IMAGE}
            alt="Aura Rider"
            className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
            initial={{ scale: 1.06 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/88 to-[#080808]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/30 to-[#080808]/50" />

          <div className="relative z-10 container mx-auto max-w-screen-2xl px-6 lg:px-14 py-14 lg:py-16 flex flex-col gap-10 lg:gap-12">
            <motion.div
              className="max-w-xl space-y-5"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Por qué Aura Rider
              </p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.05] text-white">
                De la búsqueda
                <br />
                a las llaves{' '}
                <span className="text-primary italic">en tres pasos</span>
              </h2>
            </motion.div>

            <PurchaseJourney />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <button type="button" onClick={scrollToCatalog} className="premium-btn">
                Empezar a comprar
                <ArrowRight className="size-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="motos-list" className="pt-12 pb-16 lg:pt-14 lg:pb-20">
        <div className="container mx-auto max-w-screen-2xl px-6 lg:px-14 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
                Disponibles
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-white">
                Nuestras motos
              </h2>
            </div>
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
            categories={categories
              .filter((c) => c.estado)
              .map((c) => ({ value: c.idCategoria, label: c.nombre }))}
            brands={brands
              .filter((b) => b.estado)
              .map((b) => ({ value: b.idMarca, label: b.nombre }))}
            hasFilters={hasFilters}
            onClear={clearFilters}
          />

          <div className="min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[16/10] w-full bg-white/5" />
                  ))}
                </div>
              ) : motos.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <p className="text-2xl font-semibold text-white/90">No hay resultados</p>
                  <p className="text-base text-white/50">Prueba otros filtros o limpia la búsqueda.</p>
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
          </div>
        </div>
      </section>
    </div>
  );
}
