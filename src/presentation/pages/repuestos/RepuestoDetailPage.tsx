// src/presentation/pages/repuestos/RepuestoDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRepuestoStore } from '../../store/repuesto.store';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import { canUseCart } from '../../utils/can-use-cart';
import { parseApiError } from '../../../infrastructure/http/api-error';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import {
  ShoppingCart,
  ArrowLeft,
  CheckCircle,
  Minus,
  Plus,
  AlertCircle,
  Info,
  Cog,
} from 'lucide-react';

export default function RepuestoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedRepuesto, fetchRepuestoById, isLoading, error, clearSelectedRepuesto } = useRepuestoStore();
  const { addToCart, isLoading: isCartLoading } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const clientCanUseCart = canUseCart(isAuthenticated, user);
  const isStaffUser = isAuthenticated && user?.isStaff === true;
  const isAvailable = Boolean(selectedRepuesto && selectedRepuesto.stock > 0);
  const showPurchaseControls = isAvailable && (!isAuthenticated || clientCanUseCart);

  useEffect(() => {
    if (id) {
      fetchRepuestoById(Number(id));
      setQuantity(1);
      setActionError(null);
      setSuccessMsg(null);
    }
    return () => {
      clearSelectedRepuesto();
    };
  }, [id, fetchRepuestoById, clearSelectedRepuesto]);

  useEffect(() => {
    if (selectedRepuesto && selectedRepuesto.stock > 0) {
      setQuantity((prev) => Math.min(Math.max(1, prev), selectedRepuesto.stock));
    }
  }, [selectedRepuesto]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!clientCanUseCart || !selectedRepuesto) {
      return;
    }

    setActionError(null);
    try {
      await addToCart(null, selectedRepuesto.idRepuesto, quantity);
      setSuccessMsg(`¡${quantity} × ${selectedRepuesto.nombre} agregado(s) al carrito con éxito!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setActionError(parseApiError(err, 'No se pudo agregar el repuesto al carrito.'));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full max-w-md rounded-3xl" />
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

  if (error || !selectedRepuesto) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-destructive font-semibold">{error || 'Repuesto no encontrado'}</p>
        <Link to="/repuestos">
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
      <Link
        to="/repuestos"
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="size-4" />
        Volver a Repuestos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="bg-[#0c0c0e] aspect-square max-w-md w-full rounded-3xl overflow-hidden relative flex items-center justify-center border border-neutral-900">
          {selectedRepuesto.imagen ? (
            <img
              src={selectedRepuesto.imagen}
              alt={selectedRepuesto.nombre}
              className="object-contain w-full h-full p-6"
            />
          ) : (
            <Cog className="size-24 text-neutral-600 animate-pulse" />
          )}
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border/50 text-[10px] font-black text-foreground uppercase tracking-wider">
            SKU: {selectedRepuesto.sku}
          </div>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="bg-primary/10 text-primary border border-primary/25 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                Repuesto
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-3">
                {selectedRepuesto.nombre}
              </h1>
            </div>

            <p className="text-3xl font-black text-primary">{formatPrice(selectedRepuesto.precioVenta)}</p>

            <Card className="border-border/30 bg-neutral-100 dark:bg-neutral-900/30 backdrop-blur-md rounded-2xl">
              <CardContent className="p-5 space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">SKU</span>
                  <span className="font-bold text-foreground font-mono">{selectedRepuesto.sku}</span>
                </div>
                <div className="flex justify-between border-b border-border/20 pb-2">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">Estado</span>
                  <span className="font-bold text-foreground capitalize">{selectedRepuesto.estado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">Stock disponible</span>
                  <span className={`font-bold ${isAvailable ? 'text-green-500 dark:text-green-400' : 'text-destructive'}`}>
                    {isAvailable ? `${selectedRepuesto.stock} unidades` : 'Agotado'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {selectedRepuesto.descripcion && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {selectedRepuesto.descripcion}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-4">
            {successMsg && (
              <div className="p-3.5 text-sm bg-green-500/10 border border-green-500/25 text-green-400 rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle className="size-4.5" />
                {successMsg}
              </div>
            )}

            {actionError && (
              <div className="p-3.5 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-xl flex items-center gap-2 font-semibold">
                <AlertCircle className="size-4.5 shrink-0" />
                {actionError}
              </div>
            )}

            {isStaffUser && isAvailable && (
              <div className="p-3.5 text-sm bg-muted/50 border border-border/40 text-muted-foreground rounded-xl flex items-start gap-2 font-medium">
                <Info className="size-4.5 shrink-0 mt-0.5 text-primary" />
                El carrito de compras está disponible únicamente para clientes.
              </div>
            )}

            {showPurchaseControls ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-neutral-100 dark:bg-neutral-900/30 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-none rounded-l-lg border-r border-border"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    type="button"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="flex h-12 w-12 items-center justify-center text-sm font-bold tabular-nums">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-none rounded-r-lg border-l border-border"
                    onClick={() => setQuantity(Math.min(selectedRepuesto.stock, quantity + 1))}
                    disabled={quantity >= selectedRepuesto.stock}
                    type="button"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="flex-1 gap-2 text-xs font-bold uppercase tracking-widest bg-primary hover:bg-primary/95 text-white py-6 h-12 rounded-lg"
                  disabled={isCartLoading}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="size-4" />
                  Agregar al Carrito
                </Button>
              </div>
            ) : !isStaffUser && !isAvailable ? (
              <Button size="lg" className="w-full gap-2 text-xs font-bold uppercase tracking-widest py-6 h-12 rounded-lg" disabled>
                <ShoppingCart className="size-4" />
                Agotado
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
