// src/presentation/pages/cart/CartPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useCartStore } from '../../store/cart.store';
import { useOrderStore } from '../../store/order.store';
import { useAuthStore } from '../../store/auth.store';
import { canUseCart } from '../../utils/can-use-cart';
import { useLineItemProducts } from '../../hooks/use-line-item-products';
import { CartLineItem } from '../../components/cart/CartLineItem';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import { parseApiError } from '../../../infrastructure/http/api-error';
import { ShoppingBag, ArrowRight, ArrowLeft, ShoppingCart, AlertCircle, CreditCard, Info } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const clientCanUseCart = canUseCart(isAuthenticated, user);
  const { cart, fetchActiveCart, removeFromCart, clearCart, isLoading, error: cartError } = useCartStore();
  const { createOrder, isLoading: isOrderCreating } = useOrderStore();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const lineItemProducts = useLineItemProducts(cart?.items ?? []);

  useEffect(() => {
    if (clientCanUseCart) {
      fetchActiveCart();
    }
  }, [clientCanUseCart, fetchActiveCart]);

  const isCartEditable = clientCanUseCart && cart?.estado === 'activo';
  const canCheckout = Boolean(clientCanUseCart && cart && cart.items.length > 0 && isCartEditable);

  const handleCheckout = async () => {
    if (!clientCanUseCart || !cart || cart.items.length === 0 || !isCartEditable) return;    setCheckoutError(null);
    try {
      const order = await createOrder(cart.idCarrito);
      await fetchActiveCart();
      navigate(`/orders/${order.idPedido}`);
    } catch (err: unknown) {
      setCheckoutError(parseApiError(err, 'No se pudo procesar tu pedido. Verifica la disponibilidad.'));
    }
  };

  if (isAuthenticated && user?.isStaff === true) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
  const showProcessedWarning = cart && cart.estado !== 'activo' && hasItems;

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

        {showProcessedWarning && (
          <div className="flex items-center gap-3 p-4 text-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-2xl font-medium">
            <AlertCircle className="size-5 shrink-0" />
            Este carrito ya fue procesado. No puedes modificarlo ni generar otro pedido con él.
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
              {cart.items.map((item, idx) => {
                let moto = null;
                let repuesto = null;
                let isLoadingProduct = false;
                let isProductUnavailable = false;

                if (item.idMoto !== null) {
                  moto = lineItemProducts.getMoto(item.idMoto);
                  isProductUnavailable = lineItemProducts.isMotoUnavailable(item.idMoto);
                  isLoadingProduct = !moto && !isProductUnavailable;
                } else if (item.idRepuesto !== null) {
                  repuesto = lineItemProducts.getRepuesto(item.idRepuesto);
                  isProductUnavailable = lineItemProducts.isRepuestoUnavailable(item.idRepuesto);
                  isLoadingProduct = !repuesto && !isProductUnavailable;
                }

                return (
                  <div
                    key={item.idItem}
                    className="bg-card/60 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-border transition-all duration-300 group"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <CartLineItem
                      item={item}
                      moto={moto}
                      repuesto={repuesto}
                      isLoadingProduct={isLoadingProduct}
                      isProductUnavailable={isProductUnavailable}
                      onRemove={() => removeFromCart(item.idItem)}
                      removeDisabled={!isCartEditable || isOrderCreating || !clientCanUseCart}
                    />
                  </div>
                );
              })}

              {/* Controls */}
              <div className="flex justify-between items-center pt-2">
                <Link to="/">
                  <button className="flex items-center gap-1.5 text-sm font-bold text-neutral-500 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.04]">
                    <ArrowLeft className="size-4" />
                    Seguir Comprando
                  </button>
                </Link>
                {clientCanUseCart && (
                  <button
                    onClick={() => clearCart()}
                    disabled={!isCartEditable || isOrderCreating}
                    className="text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-destructive transition-colors cursor-pointer px-4 py-2 rounded-xl border border-transparent hover:border-destructive/20 hover:bg-destructive/[0.04] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Vaciar Carrito
                  </button>
                )}
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
                {clientCanUseCart ? (
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)] hover:shadow-[0_6px_30px_rgba(255,26,26,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
                    disabled={!canCheckout || isOrderCreating}
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
                ) : (
                  <div className="p-3 text-xs bg-muted/50 border border-border/40 text-muted-foreground rounded-xl flex items-start gap-2 font-medium">
                    <Info className="size-4 shrink-0 mt-0.5 text-primary" />
                    El carrito de compras está disponible únicamente para clientes.
                  </div>
                )}

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
