// src/presentation/pages/orders/OrderDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../../store/order.store';
import { useLineItemProducts } from '../../hooks/use-line-item-products';
import { CartLineItem } from '../../components/cart/CartLineItem';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ArrowLeft, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    selectedOrder,
    fetchOrderById,
    confirmOrder,
    isLoading,
    isConfirming,
    error,
    clearSelectedOrder,
    clearError,
  } = useOrderStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const orderItems = selectedOrder?.carrito?.items ?? [];
  const lineItemProducts = useLineItemProducts(orderItems);

  useEffect(() => {
    if (id) {
      fetchOrderById(Number(id));
    }
    return () => {
      clearSelectedOrder();
      clearError();
    };
  }, [id, fetchOrderById, clearSelectedOrder, clearError]);

  const canConfirm = selectedOrder?.estado === 'pending';

  const handleConfirm = async () => {
    if (!selectedOrder || !canConfirm || isConfirming) return;

    try {
      await confirmOrder(selectedOrder.idPedido);
      setSuccessMsg('¡Pedido confirmado! El equipo procesará tu solicitud.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      // Error manejado en el store
    }
  };

  if (isLoading && !selectedOrder) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !selectedOrder) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
        <p className="text-destructive font-semibold">{error}</p>
        <Link to="/orders">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Volver a Mis Pedidos
          </Button>
        </Link>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
        <p className="text-destructive font-semibold">Pedido no encontrado</p>
        <Link to="/orders">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Volver a Mis Pedidos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
        <ArrowLeft className="size-4" />
        Volver a Mis Pedidos
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Detalle de Pedido</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">ID: #{selectedOrder.idPedido}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatDate(selectedOrder.fechaPedido)}</span>
          <StatusBadge status={selectedOrder.estado} />
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle className="size-4" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold">Productos del Pedido</h2>
          {(selectedOrder.carrito?.items || []).map((item) => {
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
              <Card key={item.idItem} className="border-border/40">
                <CardContent className="p-0">
                  <CartLineItem
                    item={item}
                    moto={moto}
                    repuesto={repuesto}
                    isLoadingProduct={isLoadingProduct}
                    isProductUnavailable={isProductUnavailable}
                    readOnly
                    compact
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card className="border-border/40 bg-muted/10 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold">Costo del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Cantidad total</span>
                <span className="font-semibold">
                  {selectedOrder.carrito?.items.reduce((acc, curr) => acc + curr.cantidad, 0) || 0}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total</span>
                <span className="text-primary text-lg">{formatPrice(selectedOrder.total)}</span>
              </div>
            </CardContent>
            {canConfirm && (
              <CardFooter className="flex-col gap-4 pt-4 border-t border-border/40">
                <p className="text-sm text-muted-foreground w-full">
                  Confirma tu pedido para que el equipo lo procese. El pago se registrará posteriormente.
                </p>
                <Button
                  className="w-full gap-2 font-semibold shadow-xs"
                  onClick={handleConfirm}
                  disabled={isConfirming}
                >
                  <CreditCard className="size-4" />
                  {isConfirming ? 'Confirmando...' : 'Confirmar Pedido'}
                </Button>
              </CardFooter>
            )}
            {selectedOrder.estado === 'confirmed' && (
              <CardFooter className="pt-4 border-t border-border/40">
                <p className="text-sm text-muted-foreground">
                  Pedido confirmado. Espera actualizaciones de envío.
                </p>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
