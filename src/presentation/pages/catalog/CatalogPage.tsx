// src/presentation/pages/catalog/CatalogPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotoStore } from '../../store/moto.store';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import { Search, Mail, ArrowRight } from 'lucide-react';

export default function CatalogPage() {
  const { motos, fetchMotos, isLoading, error } = useMotoStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Carrusel de imágenes de motos deportivas rojas (Ducati, Honda CBR, Yamaha R6)
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1600', // Ducati Panigale
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1600', // Honda CBR
    'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=1600'  // Yamaha/Suzuki Red Sportbike
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  // Auto-play de diapositivas cada 10 segundos. Al depender de currentSlide, el temporizador se reinicia al hacer clic manual.
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 10000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  // Debounce de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 550);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchMotos({ search: debouncedSearch });
  }, [debouncedSearch, fetchMotos]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION (Fondo Oscuro + Carrusel de Imágenes + Título Imponente) */}
      {/* Todo el section es clickeable con cursor pointer para pasar a la siguiente diapositiva */}
      <section 
        className="relative w-full min-h-[85vh] flex items-center bg-[#070708] border-b border-neutral-900 overflow-hidden cursor-pointer"
        onClick={nextSlide}
      >
        
        {/* Capas de imágenes del carrusel con transición suave */}
        {heroSlides.map((slideUrl, idx) => (
          <div
            key={slideUrl}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out z-0 ${
              currentSlide === idx ? 'opacity-40 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ backgroundImage: `url(${slideUrl})` }}
          />
        ))}

        {/* Gradiente horizontal y vertical optimizado para que la moto roja resalte mucho más */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070708] via-[#070708]/75 to-transparent z-1 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070708] to-transparent z-1 pointer-events-none" />

        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 py-20 pointer-events-auto">
          <div className="md:col-span-8 flex flex-col justify-center space-y-6 text-left">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">
              El camino es tuyo
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white leading-none uppercase">
              LIBERTAD<br />SIN LÍMITES
            </h1>
            <p className="text-neutral-400 text-sm max-w-md font-medium leading-relaxed">
              Descubre nuestra colección de motos diseñadas para dominar cada ruta y experimentar la máxima potencia.
            </p>
            <div className="pt-4">
              <Link to="#motos-list" onClick={(e) => {
                e.stopPropagation(); // Evita cambiar la diapositiva al hacer clic en el botón
                e.preventDefault();
                document.getElementById('motos-list')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <button className="racing-btn-outline rounded-none">
                  Ver Modelos
                  <ArrowRight className="size-4 text-primary" />
                </button>
              </Link>
            </div>
          </div>

          {/* Selector de diapositiva (derecha) */}
          <div className="hidden md:col-span-4 md:flex flex-col justify-center items-end font-bold text-xs gap-4 pr-6 select-none relative z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation(); // Evita que se dispare el doble clic en el section
                  setCurrentSlide(idx);
                }}
                className={`flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
                  currentSlide === idx ? 'text-primary' : 'text-neutral-600 hover:text-neutral-400'
                }`}
              >
                <span>0{idx + 1}</span>
                {currentSlide === idx && <span className="h-0.5 w-10 bg-primary animate-in slide-in-from-right duration-300" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION BAR (4 Columnas con Iconos Premium) */}
      <section className="bg-black py-8 border-b border-neutral-900">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          {/* Garantía Oficial */}
          <div className="flex items-start gap-4">
            <svg className="size-10 shrink-0 mt-0.5" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d4d" />
                  <stop offset="100%" stopColor="#990000" />
                </linearGradient>
              </defs>
              {/* Outer Shield */}
              <path d="M18 2C24 2 29 4.5 31 10.5C31 20 25.5 28.5 18 33C10.5 28.5 5 20 5 10.5C7 4.5 12 2 18 2Z" fill="url(#shieldGrad)" />
              {/* Inner Shield Overlay */}
              <path d="M18 4C23 4 27.2 6.1 28.8 11C28.8 19 24.3 26.2 18 30C11.7 26.2 7.2 19 7.2 11C8.8 6.1 13 4 18 4Z" fill="#000000" fillOpacity="0.25" />
              {/* Glowing Checkmark */}
              <path d="M13.5 17.5L16.5 20.5L22.5 13.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Garantía Oficial</h4>
              <p className="text-neutral-500 text-[11px] font-semibold mt-0.5">Respaldo total en todas nuestras motos.</p>
            </div>
          </div>

          {/* Mejores Precios */}
          <div className="flex items-start gap-4 border-t sm:border-t-0 sm:border-l border-neutral-900 pt-4 sm:pt-0 sm:pl-6">
            <svg className="size-10 shrink-0 mt-0.5" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="tagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b00" />
                  <stop offset="100%" stopColor="#e60000" />
                </linearGradient>
              </defs>
              {/* Price Tag Base */}
              <path d="M7 16L18 5L30 5L30 17L19 28C17.5 29.5 15.5 29.5 14 28L7 21C5.5 19.5 5.5 17.5 7 16Z" fill="url(#tagGrad)" />
              {/* Inner detail border */}
              <path d="M9.5 17L19 7.5H27.5V16L18 25.5" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.4" />
              {/* Eyelet hole */}
              <circle cx="24" cy="11" r="2.5" fill="#000000" fillOpacity="0.3" />
              <circle cx="24" cy="11" r="1.2" fill="#FFFFFF" />
            </svg>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Mejores Precios</h4>
              <p className="text-neutral-500 text-[11px] font-semibold mt-0.5">Calidad y rendimiento al mejor costo.</p>
            </div>
          </div>

          {/* Servicio Técnico */}
          <div className="flex items-start gap-4 border-t lg:border-t-0 lg:border-l border-neutral-900 pt-4 lg:pt-0 lg:pl-6">
            <svg className="size-10 shrink-0 mt-0.5" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="wrenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d4d" />
                  <stop offset="100%" stopColor="#cc0000" />
                </linearGradient>
              </defs>
              {/* Background Gear */}
              <circle cx="18" cy="18" r="8" stroke="url(#wrenchGrad)" strokeWidth="2.5" strokeDasharray="3 3" />
              {/* Sleek Crossed Wrench */}
              <path d="M9 27L23.5 12.5C24.5 11.5 26.5 11.5 27.5 12.5C28.5 13.5 28.5 15.5 27.5 16.5L13 31" stroke="url(#wrenchGrad)" strokeWidth="3.5" strokeLinecap="round" />
              {/* Wrench jaw details */}
              <path d="M25 10L28 13L25.5 15.5L22.5 12.5L25 10Z" fill="#FFFFFF" />
              <path d="M10.5 25.5L7.5 28.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Servicio Técnico</h4>
              <p className="text-neutral-500 text-[11px] font-semibold mt-0.5">Taller especializado y repuestos oficiales.</p>
            </div>
          </div>

          {/* Equipamiento Premium */}
          <div className="flex items-start gap-4 border-t lg:border-t-0 lg:border-l border-neutral-900 pt-4 lg:pt-0 lg:pl-6">
            <svg className="size-10 shrink-0 mt-0.5" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff1a1a" />
                  <stop offset="100%" stopColor="#800000" />
                </linearGradient>
              </defs>
              {/* Premium Sport Helmet Silhouette */}
              <path d="M18 4C10.5 4 6 9.5 6 17C6 24.5 10.5 28.5 15 31V32H21V31C25.5 28.5 30 24.5 30 17C30 9.5 25.5 4 18 4Z" fill="url(#helmetGrad)" />
              {/* Helmet Gloss visor */}
              <path d="M12 14.5C14.5 13 21.5 13 24 14.5C27 16.5 27 21 27 21H9C9 21 9 16.5 12 14.5Z" fill="#000000" fillOpacity="0.6" stroke="#FFFFFF" strokeWidth="1" />
              {/* White visor highlight */}
              <path d="M12.5 15.5C15 14.2 21 14.2 23.5 15.5" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
            </svg>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Equipamiento Premium</h4>
              <p className="text-neutral-500 text-[11px] font-semibold mt-0.5">Accesorios de alta gama para tu seguridad.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SECCIÓN DE PRODUCTOS (Fondo Claro + Tarjetas Blancas) */}
      <section id="motos-list" className="bg-[#f5f5f7] py-16 text-black">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 space-y-10">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1">
              <span className="text-primary font-bold text-[10px] uppercase tracking-widest">Modelos Destacados</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-neutral-900">
                Elige tu próxima máquina
              </h2>
            </div>
            
            {/* Buscador Integrado */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                placeholder="Buscar modelo o marca..."
                className="pl-9 bg-white border-neutral-300 text-neutral-900 rounded-none h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 text-sm bg-destructive/10 border border-destructive/20 text-destructive font-semibold">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-white border-neutral-200 rounded-none overflow-hidden h-[380px]">
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
            <div className="text-center py-16 text-neutral-500 font-bold">
              No hay motocicletas disponibles en el catálogo.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {motos.map((moto) => (
                <Card key={moto.idMoto} className="racing-card rounded-none h-[400px]">
                  
                  {/* Imagen de la moto */}
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
                    
                    {/* Badge de Stock */}
                    <span className={`absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                      moto.stock > 0 
                        ? 'bg-green-500/10 text-green-600 border-green-500/25' 
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {moto.stock > 0 ? 'En Stock' : 'Agotado'}
                    </span>
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{moto.marca || 'Sport'}</span>
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

                  <CardFooter className="p-5 pt-0 mt-auto flex justify-between items-center border-t border-neutral-100">
                    <Link to={`/products/${moto.idMoto}`} className="w-full flex justify-between items-center group">
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
        </div>
      </section>

      {/* 4. BANNER SOBRE NOSOTROS */}
      <section className="bg-black py-20 border-t border-neutral-900">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-video w-full rounded-none overflow-hidden relative border border-neutral-800 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1000" 
              alt="Sobre nosotros" 
              className="object-cover w-full h-full opacity-70"
            />
          </div>
          <div className="space-y-6 text-left">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">Sobre Nosotros</span>
            <h2 className="text-4xl font-black uppercase text-white leading-tight">
              PASIÓN POR LAS DOS RUEDAS
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed font-medium">
              En Aura Rider vivimos la velocidad, la libertad y la aventura. Más que vender motos, compartimos tu misma pasión y te acompañamos en cada kilómetro del camino ofreciéndote solo las mejores máquinas.
            </p>
            <div className="pt-2">
              <button className="racing-btn-outline rounded-none">
                Conócenos
                <ArrowRight className="size-4 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER / CTA BAR */}
      <section className="bg-neutral-100 py-10 border-t border-neutral-200">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-neutral-800 text-left">
            <Mail className="size-8 text-primary shrink-0" />
            <div>
              <h4 className="font-extrabold uppercase text-xs tracking-wider">Únete a nuestra comunidad</h4>
              <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">Recibe novedades, promociones y eventos exclusivos.</p>
            </div>
          </div>

          <div className="flex w-full md:max-w-md rounded-none overflow-hidden border border-neutral-300 bg-white">
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              className="flex-1 px-4 py-3 text-xs bg-transparent border-none text-neutral-800 placeholder-neutral-400 focus:outline-hidden"
            />
            <button className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-widest px-6 flex items-center justify-center transition-colors">
              Enviar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
