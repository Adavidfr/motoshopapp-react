// src/presentation/pages/cart/CartPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/cart.store';
import { useOrderStore } from '../../store/order.store';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShoppingCart, AlertCircle, CreditCard } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, fetchActiveCart, removeFromCart, clearCart, isLoading, error: cartError } = useCartStore();
  const { createOrder, isLoading: isOrderCreating } = useOrderStore();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveCart();
  }, [fetchActiveCart]);

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setCheckoutError(null);
    try {
      const order = await createOrder(cart.idCarrito);
      await fetchActiveCart();
      navigate(`/orders/${order.idPedido}`);
    } catch (err: any) {
      const data = err.response?.data;
      let errorMsg = 'No se pudo procesar tu pedido. Verifica la disponibilidad.';
      if (data && typeof data === 'object') {
        if (data.detail) errorMsg = String(data.detail);
        else if (data.error) errorMsg = String(data.error);
        else {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const firstVal = data[keys[0]];
            errorMsg = Array.isArray(firstVal) ? String(firstVal[0]) : String(firstVal);
          }
        }
      } else if (typeof data === 'string') {
        errorMsg = data;
      }
      setCheckoutError(errorMsg);
    }
  };

  if (isLoading && !cart) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-5xl space-y-6 px-4">
          <Skeleton className="h-10 w-56 bg-white/[0.06]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-28 w-full rounded-2xl bg-white/[0.06]" />
              <Skeleton className="h-28 w-full rounded-2xl bg-white/[0.06]" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl bg-white/[0.06]" />
          </div>
        </div>
      </div>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <div className="min-h-[80vh] bg-background text-foreground py-10 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShoppingCart className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Tu Carrito</h1>
            <p className="text-neutral-500 text-sm font-medium">
              {hasItems ? `${cart.numItems} artículo${cart.numItems !== 1 ? 's' : ''} en tu carrito` : 'Tu carrito está vacío'}
            </p>
          </div>
        </div>

        {/* Error messages */}
        {(checkoutError || cartError) && (
          <div className="flex items-center gap-3 p-4 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl font-medium">
            <AlertCircle className="size-5 shrink-0" />
            {checkoutError || cartError}
          </div>
        )}

        {!hasItems ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="size-24 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <ShoppingBag className="size-10 text-neutral-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Carrito Vacío</h2>
              <p className="text-neutral-500 text-sm max-w-xs">
                Explora nuestro catálogo y encuentra la moto de tus sueños.
              </p>
            </div>
            <Link to="/">
              <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold uppercase text-xs tracking-widest px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)] hover:shadow-[0_6px_30px_rgba(255,26,26,0.4)] hover:-translate-y-0.5 cursor-pointer">
                <ShoppingBag className="size-4" />
                Explorar Catálogo
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, idx) => (
                <div
                  key={item.idItem}
                  className="bg-card/60 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-border transition-all duration-300 group"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-4 items-center">
                      {/* Icon */}
                      <div className="size-16 rounded-2xl bg-primary/[0.08] border border-primary/[0.12] flex items-center justify-center text-2xl shrink-0">
                        {item.idMoto ? '🏍️' : '⚙️'}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-base text-foreground">
                          {item.idMoto ? `Motocicleta #${item.idMoto}` : `Repuesto #${item.idRepuesto}`}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                          Precio unitario: <span className="text-foreground">{formatPrice(item.precioUnitario)}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Cantidad</span>
                          <span className="text-xs font-black text-foreground bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-0.5">{item.cantidad}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                      <span className="text-xl font-black text-primary">{formatPrice(item.subtotal)}</span>
                      <button
                        onClick={() => removeFromCart(item.idItem)}
                        className="size-9 rounded-xl border border-border/50 flex items-center justify-center text-neutral-500 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/[0.06] transition-all duration-300 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Controls */}
              <div className="flex justify-between items-center pt-2">
                <Link to="/">
                  <button className="flex items-center gap-1.5 text-sm font-bold text-neutral-500 hover:text-white transition-colors cursor-pointer px-4 py-2 rounded-xl hover:bg-white/[0.04]">
                    <ArrowLeft className="size-4" />
                    Seguir Comprando
                  </button>
                </Link>
                <button
                  onClick={() => clearCart()}
                  className="text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-destructive transition-colors cursor-pointer px-4 py-2 rounded-xl border border-transparent hover:border-destructive/20 hover:bg-destructive/[0.04]"
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-card/60 border border-border/50 rounded-2xl p-6 backdrop-blur-sm sticky top-24 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-2 pb-4 border-b border-border/40">
                  <CreditCard className="size-5 text-primary" />
                  <h3 className="font-black text-base uppercase tracking-tight text-foreground">Resumen</h3>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Artículos</span>
                    <span className="font-bold text-foreground">{cart.numItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="font-bold text-foreground">{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Envío</span>
                    <span className="font-bold text-green-500">Gratis</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-border/40 pt-4">
                  <span className="font-black uppercase tracking-wider text-xs text-foreground">Total</span>
                  <span className="font-black text-2xl text-primary">{formatPrice(cart.total)}</span>
                </div>

                {/* Checkout CTA */}
                <button
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)] hover:shadow-[0_6px_30px_rgba(255,26,26,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
                  disabled={isOrderCreating}
                  onClick={handleCheckout}
                >
                  {isOrderCreating ? (
                    <>
                      <svg className="size-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="28" strokeLinecap="round" /></svg>
                      Generando Pedido...
                    </>
                  ) : (
                    <>
                      Realizar Pedido
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] font-medium text-neutral-600">
                  Pago seguro con SSL · Garantía incluida
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
