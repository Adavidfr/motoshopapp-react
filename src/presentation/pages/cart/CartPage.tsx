// src/presentation/pages/cart/CartPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../../store/cart.store';
import { useOrderStore } from '../../store/order.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice } from '../../utils/formatters';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, fetchActiveCart, removeFromCart, clearCart, isLoading } = useCartStore();
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
      // Tras crear el pedido, vaciamos el estado local del carrito y redirigimos
      await fetchActiveCart();
      navigate(`/orders/${order.idPedido}`);
    } catch (err: any) {
      setCheckoutError(err.response?.data?.detail || 'No se pudo procesar tu pedido. Verifica la disponibilidad.');
    }
  };

  if (isLoading && !cart) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Tu Carrito</h1>

      {checkoutError && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg font-medium">
          {checkoutError}
        </div>
      )}

      {!hasItems ? (
        <div className="text-center py-16 space-y-6">
          <div className="text-5xl">🛒</div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">El carrito está vacío</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Explora nuestro catálogo y agrega las motos de tu preferencia.
            </p>
          </div>
          <Link to="/">
            <Button className="gap-2">
              <ShoppingBag className="size-4" />
              Explorar Catálogo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.idItem} className="overflow-hidden border-border/40 bg-card/60">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <span className="text-3xl bg-muted p-3 rounded-2xl">🏍️</span>
                    <div>
                      <h3 className="font-bold text-base">Moto ID: {item.idMoto}</h3>
                      <p className="text-sm text-muted-foreground">
                        Precio Unitario: {formatPrice(item.precioUnitario)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: <span className="font-semibold">{item.cantidad}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                    <span className="text-lg font-bold text-primary">{formatPrice(item.subtotal)}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeFromCart(item.idItem)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center pt-2">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                  <ArrowLeft className="size-4" />
                  Seguir Comprando
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => clearCart()} className="text-destructive hover:bg-destructive/5">
                Vaciar Carrito
              </Button>
            </div>
          </div>

          {/* Checkout Summary Card */}
          <div>
            <Card className="border-border/40 shadow-sm bg-muted/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Resumen de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cantidad de motos</span>
                  <span className="font-semibold">{cart.numItems}</span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-4 text-base">
                  <span className="font-bold">Total a Pagar</span>
                  <span className="font-extrabold text-primary text-xl">{formatPrice(cart.total)}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  className="w-full gap-2 font-semibold shadow-xs"
                  size="lg"
                  disabled={isOrderCreating}
                  onClick={handleCheckout}
                >
                  {isOrderCreating ? 'Generando Pedido...' : 'Realizar Pedido'}
                  <ArrowRight className="size-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
