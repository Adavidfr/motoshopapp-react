// src/presentation/pages/catalog/ProductDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMotoStore } from '../../store/moto.store';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import { canUseCart } from '../../utils/can-use-cart';
import { parseApiError } from '../../../infrastructure/http/api-error';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import {
  getMotoAvailabilityInfo,
  formatMotoEstadoLabel,
} from '../../utils/moto-availability';
import {
  ShoppingCart,
  ArrowLeft,
  CheckCircle,
  Minus,
  Plus,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedMoto, fetchMotoById, isLoading, error, clearSelectedMoto } =
    useMotoStore();
  const { addToCart, isLoading: isCartLoading } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [buying, setBuying] = useState(false);

  const clientCanUseCart = canUseCart(isAuthenticated, user);
  const isStaffUser = isAuthenticated && user?.isStaff === true;

  useEffect(() => {
    if (id) {
      fetchMotoById(Number(id));
      setQuantity(1);
      setActionError(null);
      setSuccessMsg(null);
    }
    return () => {
      clearSelectedMoto();
    };
  }, [id, fetchMotoById, clearSelectedMoto]);

  const availability = selectedMoto ? getMotoAvailabilityInfo(selectedMoto) : null;
  const isAvailable = availability?.isAvailable ?? false;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!clientCanUseCart || !selectedMoto) {
      return;
    }

    setActionError(null);
    try {
      await addToCart(selectedMoto.idMoto, null, quantity);
      setSuccessMsg(`¡${quantity} × ${selectedMoto.modelo} agregada(s) al carrito con éxito!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setActionError(parseApiError(err, 'No se pudo agregar la moto al carrito.'));
    }
  };

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!clientCanUseCart || !selectedMoto) {
      return;
    }

    setBuying(true);
    setActionError(null);
    try {
      await addToCart(selectedMoto.idMoto, null, quantity);
      navigate('/cart');
    } catch (err: unknown) {
      setActionError(parseApiError(err, 'No se pudo iniciar la compra.'));
    } finally {
      setBuying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#080808] px-6 lg:px-12 py-8 space-y-6">
        <Skeleton className="h-6 w-40 bg-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[16/10] w-full bg-white/5" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3 bg-white/5" />
            <Skeleton className="h-8 w-1/3 bg-white/5" />
            <Skeleton className="h-40 w-full bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !selectedMoto) {
    return (
      <div className="bg-[#080808] text-center py-24 space-y-6 px-6">
        <p className="font-display text-2xl text-white/80">{error || 'Motocicleta no encontrada'}</p>
        <Link to="/catalog" className="premium-btn inline-flex">
          <ArrowLeft className="size-4" />
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const showPurchaseControls = isAvailable && (!isAuthenticated || clientCanUseCart);

  const specs = [
    { label: 'Cilindraje', value: `${selectedMoto.cilindraje} cc` },
    { label: 'Color', value: selectedMoto.color },
    { label: 'Año', value: String(selectedMoto.anio) },
    { label: 'Marca', value: selectedMoto.marca || '—' },
    { label: 'Categoría', value: selectedMoto.categoria || '—' },
    { label: 'Estado', value: formatMotoEstadoLabel(selectedMoto.estado) },
    { label: 'Stock', value: String(selectedMoto.stock) },
    {
      label: 'Disponibilidad',
      value: availability?.localLabel ?? 'No disponible',
    },
  ];

  const secondaryInfo = [
    selectedMoto.marca,
    selectedMoto.modelo,
    selectedMoto.categoria,
    selectedMoto.anio ? String(selectedMoto.anio) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="bg-[#080808] text-white">
      <div className="container mx-auto max-w-screen-2xl px-6 lg:px-14 py-8 lg:py-10 space-y-8">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/45 hover:text-primary transition-colors duration-500"
        >
          <ArrowLeft className="size-3.5" />
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="relative flex h-[280px] sm:h-[340px] lg:h-[420px] items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
              {selectedMoto.imagen ? (
                <img
                  src={selectedMoto.imagen}
                  alt={selectedMoto.modelo}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-4xl text-white/20">
                  {selectedMoto.modelo}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-white/55">
                {selectedMoto.marca || 'Sin marca'}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
                {selectedMoto.modelo}
              </h1>
              <p className="font-sans text-2xl font-semibold text-white">
                {formatPrice(selectedMoto.precio)}
              </p>
              <p className="text-sm text-white/70">
                {availability?.localLabel ?? formatMotoEstadoLabel(selectedMoto.estado)}
              </p>
              {secondaryInfo ? (
                <p className="text-sm text-white/45">
                  {secondaryInfo}
                </p>
              ) : null}
            </div>

            {availability?.unavailableHint && (
              <p className="text-xs text-white/45 border-t border-white/10 pt-3">
                {availability.unavailableHint}
              </p>
            )}

            {successMsg && (
              <div className="p-3.5 text-sm bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-2">
                <CheckCircle className="size-4.5" />
                {successMsg}
              </div>
            )}

            {actionError && (
              <div className="p-3.5 text-sm bg-destructive/10 border border-destructive/25 text-destructive flex items-center gap-2">
                <AlertCircle className="size-4.5 shrink-0" />
                {actionError}
              </div>
            )}

            {isStaffUser && isAvailable && (
              <div className="p-3.5 text-sm bg-white/[0.03] border border-white/10 text-white/55 flex items-start gap-2">
                <Info className="size-4.5 shrink-0 mt-0.5 text-primary" />
                El carrito de compras está disponible únicamente para clientes.
              </div>
            )}

            {showPurchaseControls ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center border border-white/10 w-fit">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-none border-r border-white/10 hover:bg-white/5"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    type="button"
                  >
                    <Minus className="size-4 text-white/50" />
                  </Button>
                  <span className="flex h-12 w-12 items-center justify-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-none border-l border-white/10 hover:bg-white/5"
                    onClick={() => setQuantity(Math.min(selectedMoto.stock, quantity + 1))}
                    disabled={quantity >= selectedMoto.stock}
                    type="button"
                  >
                    <Plus className="size-4 text-white/50" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className="premium-btn flex-1 disabled:opacity-50"
                    disabled={isCartLoading || buying}
                    onClick={handleBuy}
                  >
                    Comprar ahora
                  </button>
                  <button
                    type="button"
                    className="racing-btn-outline flex-1 justify-center disabled:opacity-50"
                    disabled={isCartLoading || buying}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="size-4" />
                    Agregar al carrito
                  </button>
                </div>
              </div>
            ) : !isStaffUser && !isAvailable ? (
              <Button
                size="lg"
                className="w-full gap-2 text-xs font-bold uppercase tracking-widest py-6 h-12 rounded-none"
                disabled
              >
                <ShoppingCart className="size-4" />
                {availability?.buttonLabel ?? 'No disponible'}
              </Button>
            ) : null}
          </div>
        </div>

        <section className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-2">Especificaciones</p>
            <h2 className="font-display text-2xl md:text-3xl font-medium">Ficha técnica</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] border border-white/[0.06]">
            {specs.map((spec) => (
              <div key={spec.label} className="bg-[#080808] p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">{spec.label}</p>
                <p className="font-sans text-sm font-medium text-white">{spec.value}</p>
              </div>
            ))}
          </div>
          {availability?.unavailableHint && (
            <p className="text-xs text-white/40">{availability.unavailableHint}</p>
          )}
        </section>
      </div>
    </div>
  );
}
