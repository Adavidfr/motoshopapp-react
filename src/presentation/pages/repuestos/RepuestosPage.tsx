// src/presentation/pages/repuestos/RepuestosPage.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRepuestoStore } from '../../store/repuesto.store';
import { Loader2, FileImage, Search } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export default function RepuestosPage() {
  const { repuestos, isLoading, error, fetchRepuestos } = useRepuestoStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRepuestos({ limit: 100 });
  }, [fetchRepuestos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRepuestos({ search: searchTerm || undefined, limit: 100 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight text-left">
            Catálogo de Repuestos
          </h1>
          <p className="text-muted-foreground text-sm text-left">
            Explora piezas de recambio oficiales y accesorios para tu moto
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex gap-3 bg-card border border-border rounded-full px-5 py-2.5 max-w-md items-center"
      >
        <Search className="text-neutral-500 size-4 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por nombre, SKU o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-foreground text-xs placeholder-neutral-500 font-semibold focus:outline-none focus:ring-0 w-full"
        />
        <button
          type="submit"
          className="bg-muted hover:bg-neutral-700 text-foreground rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors"
        >
          Buscar
        </button>
      </form>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs py-3 px-4 rounded-full text-center font-semibold">
          {error}
        </div>
      )}

      {isLoading && repuestos.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary size-10" />
        </div>
      ) : repuestos.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">No se encontraron repuestos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {repuestos.map((rep) => (
            <Link
              key={rep.idRepuesto}
              to={`/repuestos/${rep.idRepuesto}`}
              className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group text-left"
            >
              <div className="relative h-44 w-full bg-muted overflow-hidden">
                {rep.imagen ? (
                  <img
                    src={rep.imagen}
                    alt={rep.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                    <FileImage className="size-10 stroke-[1.5]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Sin Imagen</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border/50 text-[9px] font-black text-foreground uppercase tracking-wider font-mono">
                  SKU: {rep.sku}
                </div>
                {rep.stock <= 0 && (
                  <div className="absolute top-4 right-4 bg-destructive/90 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Agotado
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1 space-y-4">
                <div>
                  <h3 className="text-base font-black text-foreground uppercase tracking-tight truncate">
                    {rep.nombre}
                  </h3>
                  <p className="text-muted-foreground text-xs font-semibold line-clamp-2 mt-1 h-8 leading-relaxed">
                    {rep.descripcion || 'Sin descripción adicional'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <span className="text-muted-foreground text-[10px] font-bold block uppercase">Precio</span>
                    <span className="text-base font-black text-primary">{formatPrice(rep.precioVenta)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground text-[10px] font-bold block uppercase">Stock</span>
                    <span className="text-sm font-black text-foreground">{rep.stock} u.</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
