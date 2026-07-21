// src/presentation/pages/catalog/CatalogPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotoStore } from '../../store/moto.store';
import { Input } from '../../components/ui/input';
import { Card, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import { Search, ArrowRight, Zap, Shield, Star, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

import { useBrandStore } from '../../store/brand.store';
import { useCategoryStore } from '../../store/category.store';

// React Bits animated components
import SplitText from '../../components/react-bits/SplitText';
import GradientText from '../../components/react-bits/GradientText';
import Magnet from '../../components/react-bits/Magnet';
import CountUp from '../../components/react-bits/CountUp';
import Particles from '../../components/react-bits/Particles';
import TiltedCard from '../../components/react-bits/TiltedCard';
import BrandTicker from '../../components/react-bits/BrandTicker';

export default function CatalogPage() {
  const { motos, fetchMotos, isLoading } = useMotoStore();
  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');

  // Carrusel de imágenes
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1600',
      title: 'LIBERTAD',
      subtitle: 'SIN LÍMITES',
      tagline: 'El camino es tuyo',
      description: 'Descubre nuestra colección de motos diseñadas para dominar cada ruta y experimentar la máxima potencia.',
    },
    {
      url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1600',
      title: 'VELOCIDAD',
      subtitle: 'PURA',
      tagline: 'Siente la adrenalina',
      description: 'Máquinas diseñadas para quienes buscan la perfección en cada curva y la emoción en cada aceleración.',
    },
    {
      url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=1600',
      title: 'POTENCIA',
      subtitle: 'EXTREMA',
      tagline: 'Domina el asfalto',
      description: 'Motocicletas de alto rendimiento con tecnología de última generación para los más exigentes.',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  // Debounce
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 550);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  useEffect(() => {
    const params: any = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedBrand) params.marca = selectedBrand;
    if (selectedCategory) params.categoria = selectedCategory;
    if (selectedOrder) params.ordering = selectedOrder;
    fetchMotos(params);
  }, [debouncedSearch, selectedBrand, selectedCategory, selectedOrder, fetchMotos]);

  // Motion variants para el grid escalonado
  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 400, damping: 30 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ═══════════════════════════════════════════════════════════
          FASE 4: HERO SECTION – Particles Reactivas + Unsplash + TextSplit
         ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full min-h-[90vh] flex items-center bg-neutral-100/30 dark:bg-[#050506]/40 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-900/50 overflow-hidden cursor-pointer transition-colors duration-500"
        onClick={nextSlide}
      >
        {/* Interactive Particles Background (Reacciona al cursor) */}
        <div className="absolute inset-0 z-0">
          <Particles
            quantity={100}
            color="255, 26, 26"
            speed={0.5}
            connectDistance={120}
            size={1.5}
          />
        </div>

        {/* Carousel Images with Ken Burns effect (Unsplash HQ) */}
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.url}
            className={`absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-[1500ms] ease-in-out ${
              currentSlide === idx
                ? 'opacity-40 animate-ken-burns'
                : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${slide.url})` }}
          />
        ))}

        {/* Gradient Overlays para profundidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-100 dark:from-[#050506] via-neutral-100/70 dark:via-[#050506]/70 to-transparent z-[2] pointer-events-none transition-colors duration-500" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-100 dark:from-[#050506] to-transparent z-[2] pointer-events-none transition-colors duration-500" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-neutral-100/50 dark:from-[#050506]/50 to-transparent z-[2] pointer-events-none transition-colors duration-500" />

        {/* Decorative Speed Lines */}
        <svg className="absolute right-0 top-1/4 w-96 h-96 opacity-[0.04] z-[2] pointer-events-none" viewBox="0 0 400 400">
          <line x1="0" y1="100" x2="400" y2="80" stroke="#ff1a1a" strokeWidth="2" strokeDasharray="20 30" style={{ animation: 'dash-speed 2s linear infinite' }} />
          <line x1="0" y1="200" x2="400" y2="190" stroke="#ff1a1a" strokeWidth="1.5" strokeDasharray="15 25" style={{ animation: 'dash-speed 3s linear infinite' }} />
        </svg>

        {/* Hero Content */}
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 py-24 pointer-events-auto">
          <div className="md:col-span-8 flex flex-col justify-center space-y-7 text-left">

            {/* Animated Tagline */}
            <GradientText
              className="font-bold text-xs uppercase tracking-[0.25em]"
              colors={['#ff1a1a', '#ff6b35', '#ffaa00', '#ff6b35', '#ff1a1a']}
              animationSpeed={3}
            >
              {heroSlides[currentSlide].tagline}
            </GradientText>

            {/* Main Title with SplitText */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.85] uppercase">
              <SplitText
                key={`title-${currentSlide}`}
                text={heroSlides[currentSlide].title}
                delay={50}
                animationFrom={{ opacity: 0, transform: 'translateY(60px) rotateX(20deg)' }}
                animationTo={{ opacity: 1, transform: 'translateY(0) rotateX(0deg)' }}
              />
              <br />
              <span className="text-primary drop-shadow-2xl">
                <SplitText
                  key={`subtitle-${currentSlide}`}
                  text={heroSlides[currentSlide].subtitle}
                  delay={50}
                  animationFrom={{ opacity: 0, transform: 'translateY(60px) rotateX(20deg)' }}
                  animationTo={{ opacity: 1, transform: 'translateY(0) rotateX(0deg)' }}
                />
              </span>
            </h1>

            {/* Description */}
            <p className="text-neutral-700 dark:text-neutral-300 text-sm max-w-lg font-medium leading-relaxed drop-shadow-md">
              {heroSlides[currentSlide].description}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <Magnet magnetStrength={0.3} padding={40}>
                <Link to="#motos-list" onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  document.getElementById('motos-list')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  <button className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs px-8 py-4 flex items-center gap-2 transition-all duration-300 animate-pulse-glow cursor-pointer rounded-xl shadow-[0_0_20px_rgba(255,26,26,0.4)]">
                    Ver Modelos
                    <ArrowRight className="size-4" />
                  </button>
                </Link>
              </Magnet>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="hidden md:col-span-4 md:flex flex-col justify-end items-end gap-3 pb-4 select-none relative z-20">
            {heroSlides.map((slide, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                className={`flex items-center gap-3 cursor-pointer transition-all duration-500 group ${
                  currentSlide === idx ? 'text-foreground' : 'text-neutral-500 dark:text-neutral-600 hover:text-foreground'
                }`}
              >
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {currentSlide === idx ? slide.subtitle : `0${idx + 1}`}
                </span>
                <span className={`h-[2px] transition-all duration-700 ${
                  currentSlide === idx ? 'w-16 bg-primary' : 'w-6 bg-neutral-700 group-hover:w-10 group-hover:bg-neutral-500'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BRANDS TICKER
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50/50 dark:bg-[#080809]/50 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-900/50 transition-colors duration-500">
        <BrandTicker speed={30} />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FASE 5: POR QUÉ ELEGIRNOS – Glassmorphism + Framer Motion
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-background py-20 border-b border-border/40">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <GradientText
              className="font-bold text-[10px] uppercase tracking-[0.25em]"
              colors={['#ff1a1a', '#ff6b35', '#ffaa00', '#ff6b35', '#ff1a1a']}
              animationSpeed={4}
            >
              ¿Por qué elegirnos?
            </GradientText>
            <h3 className="text-3xl font-black uppercase tracking-tight text-foreground mt-2">La mejor experiencia en motos</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: 'Garantía Oficial', desc: 'Respaldo total del fabricante en todas nuestras motocicletas.', color: 'rgba(255, 26, 26, 1)', shadow: 'rgba(255, 26, 26, 0.4)' },
            { icon: Zap, title: 'Mejores Precios', desc: 'Financiamiento directo con las tasas más competitivas.', color: 'rgba(255, 107, 53, 1)', shadow: 'rgba(255, 107, 53, 0.4)' },
            { icon: Truck, title: 'Envío Nacional', desc: 'Entrega puerta a puerta en todo el país con seguro.', color: 'rgba(0, 180, 216, 1)', shadow: 'rgba(0, 180, 216, 0.4)' },
            { icon: Star, title: 'Equipo Premium', desc: 'Accesorios certificados de alta gama para tu seguridad.', color: 'rgba(255, 170, 0, 1)', shadow: 'rgba(255, 170, 0, 0.4)' },
          ].map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
              className="h-full"
            >
              <div className="relative glass-panel rounded-[2.5rem] p-8 h-full flex flex-col justify-start overflow-hidden group hover:-translate-y-3 transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-neutral-200/50 dark:border-white/5 hover:border-white/20">
                
                {/* Background Ambient Glow (Activated on hover) */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${feat.shadow} 0%, transparent 70%)` }}
                />

                {/* Massive Watermark Number */}
                <div className="absolute -top-12 -right-6 text-[140px] font-black text-black/5 dark:text-white/[0.02] select-none group-hover:text-black/10 dark:group-hover:text-white/[0.05] group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-700 tracking-tighter pointer-events-none">
                  0{idx + 1}
                </div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Ultra-Premium Complex Icon */}
                  <div className="relative size-24 mb-8 flex items-center justify-center">
                    {/* Outer Rotating Ring */}
                    <div 
                      className="absolute inset-0 rounded-full border border-dashed opacity-20 group-hover:animate-[spin_4s_linear_infinite]"
                      style={{ borderColor: feat.color }}
                    />
                    {/* Inner Pulsing Core */}
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className="relative size-16 rounded-[1.5rem] flex items-center justify-center rotate-3 group-hover:-rotate-3 transition-transform duration-500 backdrop-blur-md"
                      style={{ 
                        background: `linear-gradient(135deg, ${feat.color}22, ${feat.color}05)`,
                        border: `1px solid ${feat.color}44`,
                        boxShadow: `0 0 40px ${feat.shadow}, inset 0 0 20px ${feat.shadow}`
                      }}
                    >
                      {/* Overlay Icon */}
                      <feat.icon 
                        className="size-8 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                        style={{ color: feat.color }} 
                      />
                    </motion.div>
                  </div>

                  <h4 className="text-foreground font-black uppercase tracking-[0.15em] text-[13px] mb-4 transition-colors duration-300 drop-shadow-md">
                    {feat.title}
                  </h4>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs font-semibold leading-relaxed group-hover:text-neutral-800 dark:group-hover:text-neutral-300 transition-colors duration-300">
                    {feat.desc}
                  </p>
                </div>
                
                {/* Bottom decorative line */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-current transition-all duration-700 opacity-50" style={{ color: feat.color }} />
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FASE 3: CATÁLOGO DE MOTOS – Glassmorphism + Stagger Grid
         ═══════════════════════════════════════════════════════════ */}
      <section id="motos-list" className="bg-background text-foreground py-24 transition-colors duration-300">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 space-y-12">

          {/* Section Header */}
          <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
            <div className="space-y-2 text-left">
              <GradientText
                className="font-bold text-[10px] uppercase tracking-[0.2em]"
                colors={['#ff1a1a', '#ff6b35', '#ffaa00', '#ff6b35', '#ff1a1a']}
                animationSpeed={4}
              >
                Modelos Destacados
              </GradientText>
              <h2 className="text-4xl font-black uppercase tracking-tight text-foreground">
                Elige tu próxima máquina
              </h2>
            </div>

            {/* Filters (Glassmorphism styling) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full lg:max-w-4xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-500 dark:text-neutral-400" />
                <Input
                  placeholder="Buscar..."
                  className="pl-11 glass-panel text-foreground rounded-xl h-12 text-xs font-medium focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 text-foreground rounded-xl h-12 px-4 text-xs font-medium focus:border-primary transition-all cursor-pointer outline-none"
              >
                <option value="" className="bg-background">Categorías</option>
                {categories.filter(c => c.estado).map((cat) => (
                  <option key={cat.idCategoria} value={cat.idCategoria} className="bg-background">{cat.nombre}</option>
                ))}
              </select>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 text-foreground rounded-xl h-12 px-4 text-xs font-medium focus:border-primary transition-all cursor-pointer outline-none"
              >
                <option value="" className="bg-background">Marcas</option>
                {brands.filter(b => b.estado).map((b) => (
                  <option key={b.idMarca} value={b.idMarca} className="bg-background">{b.nombre}</option>
                ))}
              </select>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 text-foreground rounded-xl h-12 px-4 text-xs font-medium focus:border-primary transition-all cursor-pointer outline-none"
              >
                <option value="" className="bg-background">Ordenar Por</option>
                <option value="precio" className="bg-background">Precio: Menor a Mayor</option>
                <option value="-precio" className="bg-background">Precio: Mayor a Menor</option>
                <option value="modelo" className="bg-background">Modelo: A-Z</option>
                <option value="-anio" className="bg-background">Año: Más Reciente</option>
              </select>
            </div>
          </div>

          {/* Product Grid con Framer Motion Stagger */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[450px] rounded-[2rem] bg-white/5" />
              ))}
            </div>
          ) : motos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="size-8 text-neutral-500 dark:text-neutral-400" />
              <h3 className="text-foreground text-lg font-black tracking-tight mt-4 uppercase">No hay resultados</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-2 font-medium">Intenta con otros filtros de búsqueda.</p>
            </div>
          ) : (
            <motion.div 
              variants={gridVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {motos.map((moto) => (
                <motion.div key={moto.idMoto} variants={itemVariants}>
                  <TiltedCard
                    className="relative w-full h-full"
                    maxTilt={5}
                    scale={1}
                    glareOpacity={0.05}
                  >
                    {/* Glassmorphism Card Premium */}
                    <Card
                      className="glass-panel h-[480px] overflow-hidden group flex flex-col justify-between rounded-[2.5rem] hover:shadow-[0_20px_50px_rgba(255,26,26,0.25)] transition-all duration-700 cursor-pointer border border-neutral-200 dark:border-white/10 hover:border-primary/50 relative"
                    >
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
                          <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] bg-background/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-border shadow-xl">
                            {moto.marca}
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
                  </TiltedCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SOBRE NOSOTROS – Parallax Image + CountUp Stats
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-100/30 dark:bg-[#050506]/30 backdrop-blur-sm py-24 border-t border-neutral-200/50 dark:border-neutral-900/50 relative overflow-hidden transition-colors duration-500">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Image with floating animation */}
          <div className="relative">
            <div className="aspect-video w-full overflow-hidden relative border border-neutral-300 dark:border-neutral-800 shadow-2xl animate-float">
              <img
                src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1000"
                alt="Sobre nosotros"
                className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-500 hover:scale-105 transition-transform"
              />
            </div>
            {/* Floating stat badge */}
            <div className="absolute -bottom-6 -right-4 bg-primary text-white px-6 py-4 shadow-2xl animate-breathe-glow rounded-xl">
              <span className="text-3xl font-black block">
                <CountUp to={10} suffix="+" duration={2000} />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Años de Experiencia</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-7 text-left">
            <GradientText
              className="font-bold text-xs uppercase tracking-[0.2em]"
              colors={['#ff1a1a', '#ff6b35', '#ffaa00', '#ff6b35', '#ff1a1a']}
              animationSpeed={3}
            >
              Sobre Nosotros
            </GradientText>
            <h2 className="text-4xl md:text-5xl font-black uppercase text-foreground leading-[0.95]">
              PASIÓN POR LAS{' '}
              <span className="text-primary">DOS RUEDAS</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed font-medium max-w-lg">
              En Aura Rider vivimos la velocidad, la libertad y la aventura. Más que vender motos, compartimos tu misma pasión y te acompañamos en cada kilómetro del camino ofreciéndote solo las mejores máquinas.
            </p>

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-8 pt-4">
              {[
                { value: 500, suffix: '+', label: 'Motos Vendidas' },
                { value: 15, suffix: '+', label: 'Marcas Aliadas' },
                { value: 98, suffix: '%', label: 'Satisfacción' },
              ].map((stat, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-4">
                  <span className="text-3xl font-black text-foreground">
                    <CountUp to={stat.value} suffix={stat.suffix} duration={2500} />
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Magnet magnetStrength={0.25} padding={30}>
                <button className="racing-btn-outline rounded-none cursor-pointer">
                  Conócenos
                  <ArrowRight className="size-4 text-primary" />
                </button>
              </Magnet>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
