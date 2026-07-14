// src/presentation/pages/catalog/CatalogPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMotoStore } from '../../store/moto.store';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import { Search, Eye, Filter, Sparkles } from 'lucide-react';

export default function CatalogPage() {
  const { motos, fetchMotos, isLoading, error } = useMotoStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Banner Section - Cyberpunk Grid background style */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-primary/20 py-20 px-8 text-center shadow-[0_20px_50px_rgba(255,107,0,0.1)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/25 animate-pulse">
            <Sparkles className="size-3.5" />
            Catálogo Premium 2026
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            ALTO RENDIMIENTO EN <span className="bg-linear-to-r from-primary to-orange-400 bg-clip-text text-transparent">DOS RUEDAS</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto">
            Explora las motocicletas más veloces, eficientes y exclusivas del mercado nacional.
          </p>
        </div>
      </section>

      {/* Filters & Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-border/40">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por modelo, marca..."
            className="pl-10 pr-4 py-5 bg-background/50 border-neutral-800 focus:border-primary/50 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" className="flex items-center gap-1.5 text-sm rounded-xl border-neutral-800 hover:bg-neutral-800/40">
            <Filter className="size-4" />
            Filtrar Catálogo
          </Button>
        </div>
      </div>

      {/* Grid of Motos */}
      {error && (
        <div className="p-4 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-xl text-center">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-neutral-900 bg-neutral-900/20">
              <Skeleton className="aspect-video w-full" />
              <CardHeader className="p-5 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Skeleton className="h-6 w-1/2" />
              </CardContent>
              <CardFooter className="p-5 border-t border-neutral-900">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : motos.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 font-medium">
          No se encontraron motocicletas disponibles que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {motos.map((moto) => (
            <Card key={moto.idMoto} className="glass-card group overflow-hidden flex flex-col justify-between rounded-2xl">
              <div>
                <div className="aspect-video w-full bg-neutral-900/40 relative overflow-hidden flex items-center justify-center border-b border-border/10">
                  {moto.imagen ? (
                    <img
                      src={moto.imagen}
                      alt={moto.modelo}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🏍️</span>
                  )}
                  <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border backdrop-blur-sm ${
                    moto.stock > 0 
                      ? 'bg-green-500/10 text-green-400 border-green-500/25' 
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}>
                    {moto.stock > 0 ? 'En Stock' : 'Agotado'}
                  </span>
                </div>

                <CardHeader className="p-5">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">{moto.marca || 'Sport'}</span>
                  <CardTitle className="text-lg font-bold text-white line-clamp-1 group-hover:text-primary transition-colors mt-0.5">
                    {moto.modelo}
                  </CardTitle>
                  <div className="flex gap-2 text-xs text-neutral-400 font-semibold mt-1">
                    <span>Modelo: {moto.anio}</span>
                    <span>•</span>
                    <span>{moto.cilindraje} cc</span>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5 pt-0">
                  <p className="text-2xl font-black text-white">{formatPrice(moto.precio)}</p>
                </CardContent>
              </div>

              <CardFooter className="p-5 border-t border-border/20 bg-neutral-900/20">
                <Link to={`/products/${moto.idMoto}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl border-neutral-800 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 font-semibold text-xs">
                    <Eye className="size-4" />
                    Detalles
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
