// src/presentation/pages/catalog/ProductDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMotoStore } from '../../store/moto.store';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import { ShoppingCart, ArrowLeft, Shield, Sparkles, CheckCircle } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedMoto, fetchMotoById, isLoading, error, clearSelectedMoto } = useMotoStore();
  const { addToCart, isLoading: isCartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMotoById(Number(id));
    }
    return () => {
      clearSelectedMoto();
    };
  }, [id, fetchMotoById, clearSelectedMoto]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selectedMoto) {
      try {
        await addToCart(selectedMoto.idMoto, 1, selectedMoto.precio);
        setSuccessMsg('¡Moto añadida al carrito con éxito!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch {
        // Error manejado en el store
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-video w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !selectedMoto) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-destructive font-semibold">{error || 'Motocicleta no encontrada'}</p>
        <Link to="/">
          <Button variant="outline" className="gap-2 rounded-xl">
            <ArrowLeft className="size-4" />
            Volver al Catálogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-primary transition-colors font-medium">
        <ArrowLeft className="size-4" />
        Volver al Catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image Panel with Glow effect */}
        <div className="bg-neutral-900/40 aspect-video w-full rounded-3xl overflow-hidden relative flex items-center justify-center border border-primary/10 shadow-[0_15px_30px_rgba(255,107,0,0.05)]">
          {selectedMoto.imagen ? (
            <img
              src={selectedMoto.imagen}
              alt={selectedMoto.modelo}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-8xl animate-bounce">🏍️</span>
          )}
        </div>

        {/* Details Panel */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="bg-primary/10 text-primary border border-primary/25 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                Modelo {selectedMoto.anio}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
                {selectedMoto.modelo}
              </h1>
            </div>

            <p className="text-3xl font-black text-primary">{formatPrice(selectedMoto.precio)}</p>

            <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md rounded-2xl">
              <CardContent className="p-5 space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span className="text-neutral-400 font-medium">Cilindraje</span>
                  <span className="font-bold text-white">{selectedMoto.cilindraje} cc</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span className="text-neutral-400 font-medium">Color Exterior</span>
                  <span className="font-bold text-white">{selectedMoto.color}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span className="text-neutral-400 font-medium">Estado General</span>
                  <span className="font-bold text-primary capitalize">{selectedMoto.estado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Disponibilidad en Local</span>
                  <span className={`font-bold ${selectedMoto.stock > 0 ? 'text-green-400' : 'text-destructive'}`}>
                    {selectedMoto.stock > 0 ? `${selectedMoto.stock} unidades` : 'Agotada'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-900/30 rounded-xl border border-border/20">
                <Shield className="size-5 text-primary shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-white">Garantía Directa</p>
                  <p className="text-neutral-400 mt-0.5">Cobertura de fábrica</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-900/30 rounded-xl border border-border/20">
                <Sparkles className="size-5 text-primary shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-white">Certificación</p>
                  <p className="text-neutral-400 mt-0.5">Inspeccionado al 100%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            {successMsg && (
              <div className="p-3.5 text-sm bg-green-500/10 border border-green-500/25 text-green-400 rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle className="size-4.5" />
                {successMsg}
              </div>
            )}

            <Button
              size="lg"
              className="w-full gap-2 text-base font-bold shadow-md rounded-xl btn-primary-gradient"
              disabled={selectedMoto.stock === 0 || isCartLoading}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-5" />
              {selectedMoto.stock === 0 ? 'Agotado Temporalmente' : 'Agregar al Carrito'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
