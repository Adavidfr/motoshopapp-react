// src/presentation/pages/catalog/CatalogPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotoStore } from '../../store/moto.store';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import { Search, Mail, ArrowRight, Zap, Shield, Star, Truck } from 'lucide-react';

import { useBrandStore } from '../../store/brand.store';
import { useCategoryStore } from '../../store/category.store';

// React Bits animated components
import SplitText from '../../components/react-bits/SplitText';
import GradientText from '../../components/react-bits/GradientText';
import ShinyText from '../../components/react-bits/ShinyText';
import Magnet from '../../components/react-bits/Magnet';
import SpotlightCard from '../../components/react-bits/SpotlightCard';
import CountUp from '../../components/react-bits/CountUp';
import Particles from '../../components/react-bits/Particles';
import TiltedCard from '../../components/react-bits/TiltedCard';
import InfiniteScroll from '../../components/react-bits/InfiniteScroll';

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

  // Brand logos for infinite scroll marquee
  const brandLogos = [
    { name: 'Yamaha', logo: '🏍️' },
    { name: 'Honda', logo: '🔴' },
    { name: 'Kawasaki', logo: '🟢' },
    { name: 'Suzuki', logo: '🔵' },
    { name: 'Ducati', logo: '❤️' },
    { name: 'BMW', logo: '⚪' },
    { name: 'KTM', logo: '🟠' },
    { name: 'Triumph', logo: '🇬🇧' },
  ];

  return (
    <div className="flex flex-col min-h-screen">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO SECTION – Particles + Carousel + Animated Text
         ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full min-h-[90vh] flex items-center bg-[#050506] border-b border-neutral-900 overflow-hidden cursor-pointer"
        onClick={nextSlide}
      >
        {/* Interactive Particles Background */}
        <Particles
          quantity={70}
          color="255, 26, 26"
          speed={0.3}
          connectDistance={100}
          size={1.2}
        />

        {/* Carousel Images with Ken Burns effect */}
        {heroSlides.map((slide, idx) => (
          <div
            key={slide.url}
            className={`absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-[1500ms] ease-in-out ${
              currentSlide === idx
                ? 'opacity-35 animate-ken-burns'
                : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${slide.url})` }}
          />
        ))}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050506] via-[#050506]/80 to-transparent z-[2] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050506] to-transparent z-[2] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#050506]/50 to-transparent z-[2] pointer-events-none" />

        {/* Decorative Speed Lines */}
        <svg className="absolute right-0 top-1/4 w-96 h-96 opacity-[0.04] z-[2] pointer-events-none" viewBox="0 0 400 400">
          <line x1="0" y1="100" x2="400" y2="80" stroke="#ff1a1a" strokeWidth="2" strokeDasharray="20 30" style={{ animation: 'dash-speed 3s linear infinite' }} />
          <line x1="0" y1="200" x2="400" y2="190" stroke="#ff1a1a" strokeWidth="1.5" strokeDasharray="15 25" style={{ animation: 'dash-speed 4s linear infinite' }} />
          <line x1="0" y1="300" x2="400" y2="310" stroke="#ff1a1a" strokeWidth="1" strokeDasharray="10 20" style={{ animation: 'dash-speed 5s linear infinite' }} />
        </svg>

        {/* Hero Content */}
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 py-24 pointer-events-auto">
          <div className="md:col-span-7 flex flex-col justify-center space-y-7 text-left">

            {/* Animated Tagline */}
            <GradientText
              className="font-bold text-xs uppercase tracking-[0.25em]"
              colors={['#ff1a1a', '#ff6b35', '#ffaa00', '#ff6b35', '#ff1a1a']}
              animationSpeed={3}
            >
              {heroSlides[currentSlide].tagline}
            </GradientText>

            {/* Main Title with SplitText */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] uppercase">
              <SplitText
                key={`title-${currentSlide}`}
                text={heroSlides[currentSlide].title}
                delay={50}
                animationFrom={{ opacity: 0, transform: 'translateY(60px) rotateX(20deg)' }}
                animationTo={{ opacity: 1, transform: 'translateY(0) rotateX(0deg)' }}
              />
              <br />
              <span className="text-primary">
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
            <p className="text-neutral-400 text-sm max-w-lg font-medium leading-relaxed">
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
                  <button className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs px-8 py-4 flex items-center gap-2 transition-all duration-300 animate-pulse-glow cursor-pointer">
                    Ver Modelos
                    <ArrowRight className="size-4" />
                  </button>
                </Link>
              </Magnet>
              <Magnet magnetStrength={0.2} padding={30}>
                <Link to="/catalog" onClick={(e) => e.stopPropagation()}>
                  <button className="racing-btn-outline rounded-none cursor-pointer">
                    Explorar Catálogo
                    <ArrowRight className="size-4 text-primary" />
                  </button>
                </Link>
              </Magnet>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="hidden md:col-span-5 md:flex flex-col justify-end items-end gap-3 pb-4 select-none relative z-20">
            {heroSlides.map((slide, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                className={`flex items-center gap-3 cursor-pointer transition-all duration-500 group ${
                  currentSlide === idx ? 'text-white' : 'text-neutral-700 hover:text-neutral-400'
                }`}
              >
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {currentSlide === idx ? slide.title : `0${idx + 1}`}
                </span>
                <span className={`h-[2px] transition-all duration-700 ${
                  currentSlide === idx ? 'w-16 bg-primary' : 'w-6 bg-neutral-800 group-hover:w-10 group-hover:bg-neutral-600'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-float pointer-events-none">
          <span className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-neutral-600 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. BRANDS MARQUEE – Infinite Auto-Scroll
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#080809] py-6 border-b border-neutral-900 overflow-hidden">
        <InfiniteScroll speed={20} direction="left" pauseOnHover>
          {brandLogos.map((brand, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-8 py-2 text-neutral-600 hover:text-neutral-300 transition-colors duration-300 cursor-default select-none shrink-0"
            >
              <span className="text-2xl">{brand.logo}</span>
              <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{brand.name}</span>
            </div>
          ))}
        </InfiniteScroll>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. VALUE PROPOSITION – 4 Animated Feature Cards
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#060607] py-14 border-b border-neutral-900">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: 'Garantía Oficial', desc: 'Respaldo total en todas nuestras motos', color: '#ff4d4d' },
            { icon: Zap, title: 'Mejores Precios', desc: 'Financiamiento directo y facilidades de pago', color: '#ff6b00' },
            { icon: Truck, title: 'Envío Nacional', desc: 'Entrega puerta a puerta en todo el país', color: '#00b4d8' },
            { icon: Star, title: 'Equipo Premium', desc: 'Accesorios de alta gama para tu seguridad', color: '#ffd60a' },
          ].map((feat, idx) => (
            <SpotlightCard
              key={idx}
              className="bg-[#0a0a0c] border border-neutral-900/60 p-6 rounded-2xl group hover:border-neutral-800 transition-all duration-500"
              spotlightColor={`${feat.color}15`}
              spotlightSize={200}
            >
              <div className="flex items-start gap-4">
                <div
                  className="size-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500"
                  style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}25` }}
                >
                  <feat.icon className="size-5" style={{ color: feat.color }} />
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-wider text-xs">{feat.title}</h4>
                  <p className="text-neutral-500 text-[11px] font-semibold mt-1">{feat.desc}</p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. CATÁLOGO DE MOTOS – TiltedCards + SpotlightEffect
         ═══════════════════════════════════════════════════════════ */}
      <section id="motos-list" className="bg-background text-foreground py-20 transition-colors duration-300">
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
              <p className="text-neutral-500 text-sm font-medium max-w-md">
                Explora nuestra selección de motocicletas de las mejores marcas del mercado.
              </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full lg:max-w-4xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  placeholder="Buscar modelo o color..."
                  className="pl-9 bg-card border-border text-card-foreground rounded-none h-11 text-xs focus-visible:ring-1 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-card border border-border text-card-foreground rounded-none h-11 px-4 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">Todas las Categorías</option>
                {categories.filter(c => c.estado).map((cat) => (
                  <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
                ))}
              </select>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-card border border-border text-card-foreground rounded-none h-11 px-4 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">Todas las Marcas</option>
                {brands.filter(b => b.estado).map((b) => (
                  <option key={b.idMarca} value={b.idMarca}>{b.nombre}</option>
                ))}
              </select>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="bg-card border border-border text-card-foreground rounded-none h-11 px-4 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">Ordenar Por</option>
                <option value="precio">Precio: Menor a Mayor</option>
                <option value="-precio">Precio: Mayor a Menor</option>
                <option value="modelo">Modelo: A-Z</option>
                <option value="-anio">Año: Más Reciente</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[420px] rounded-none" />
              ))}
            </div>
          ) : motos.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex size-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 mb-4">
                <Search className="size-8 text-neutral-400" />
              </div>
              <p className="text-neutral-500 font-bold text-sm">No hay motocicletas disponibles.</p>
              <p className="text-neutral-400 text-xs mt-1">Intenta con otros filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {motos.map((moto, idx) => (
                <TiltedCard
                  key={moto.idMoto}
                  className="relative"
                  maxTilt={8}
                  scale={1.02}
                  glareOpacity={0.1}
                >
                  <Card
                    className="racing-card rounded-none h-[420px] overflow-hidden group"
                    style={{
                      animation: `slide-up-card 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 80}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    {/* Image */}
                    <div className="aspect-video w-full bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden flex items-center justify-center p-4">
                      {moto.imagen ? (
                        <img
                          src={moto.imagen}
                          alt={moto.modelo}
                          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <span className="text-5xl">🏍️</span>
                      )}
                      {/* Stock Badge */}
                      <span className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2.5 py-1 tracking-wider border ${
                        moto.stock > 0
                          ? 'bg-green-500/10 text-green-600 border-green-500/25'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        {moto.stock > 0 ? 'En Stock' : 'Agotado'}
                      </span>
                    </div>

                    {/* Info */}
                    <CardHeader className="p-5 pb-2">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">{moto.marca || 'Sport'}</span>
                      <CardTitle className="text-base font-black text-card-foreground mt-0.5 truncate uppercase">
                        {moto.modelo}
                      </CardTitle>
                      <p className="text-[11px] text-neutral-400 font-bold mt-0.5">
                        {moto.categoria || 'Naked'}
                      </p>
                    </CardHeader>

                    <CardContent className="px-5 pb-5 pt-0">
                      <p className="text-xl font-extrabold text-card-foreground">
                        <ShinyText text={formatPrice(moto.precio)} speed={4} />
                      </p>
                    </CardContent>

                    <CardFooter className="px-5 py-4 mt-auto flex justify-between items-center border-t border-border">
                      <Link to={`/products/${moto.idMoto}`} className="w-full flex justify-between items-center group/link">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-card-foreground/75 group-hover/link:text-primary transition-colors">
                          Ver Detalles
                        </span>
                        <ArrowRight className="size-4 text-neutral-400 group-hover/link:text-primary group-hover/link:translate-x-1.5 transition-all duration-300" />
                      </Link>
                    </CardFooter>
                  </Card>
                </TiltedCard>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. SOBRE NOSOTROS – Parallax Image + CountUp Stats
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#050506] py-24 border-t border-neutral-900 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Image with floating animation */}
          <div className="relative">
            <div className="aspect-video w-full overflow-hidden relative border border-neutral-800 shadow-2xl animate-float">
              <img
                src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1000"
                alt="Sobre nosotros"
                className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-500 hover:scale-105 transition-transform"
              />
            </div>
            {/* Floating stat badge */}
            <div className="absolute -bottom-6 -right-4 bg-primary text-white px-6 py-4 shadow-2xl animate-breathe-glow">
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
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white leading-[0.95]">
              PASIÓN POR LAS{' '}
              <span className="text-primary">DOS RUEDAS</span>
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium max-w-lg">
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
                  <span className="text-3xl font-black text-white">
                    <CountUp to={stat.value} suffix={stat.suffix} duration={2500} />
                  </span>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider mt-1">{stat.label}</p>
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

      {/* ═══════════════════════════════════════════════════════════
          6. NEWSLETTER / CTA – Premium Dark Banner
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0a0a0c] py-16 border-t border-neutral-900 overflow-hidden">
        {/* Decorative accent lines */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-5 text-left">
              <div className="size-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 animate-breathe-glow">
                <Mail className="size-6 text-primary" />
              </div>
              <div>
                <h4 className="font-black uppercase text-sm tracking-wider text-white">Únete a nuestra comunidad</h4>
                <p className="text-[12px] text-neutral-500 font-semibold mt-0.5">Recibe novedades, promociones y eventos exclusivos.</p>
              </div>
            </div>

            <div className="flex w-full md:max-w-md overflow-hidden border border-neutral-800 bg-[#0c0c0e] hover:border-neutral-700 transition-colors duration-300">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-5 py-4 text-xs bg-transparent border-none text-white placeholder-neutral-600 focus:outline-hidden font-medium"
              />
              <Magnet magnetStrength={0.15} padding={20}>
                <button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest px-8 h-full flex items-center justify-center transition-all duration-300 cursor-pointer">
                  Enviar
                </button>
              </Magnet>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
