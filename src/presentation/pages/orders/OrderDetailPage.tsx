// src/presentation/pages/orders/OrderDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../../store/order.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ArrowLeft, CheckCircle, CreditCard } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { selectedOrder, fetchOrderById, confirmOrder, isLoading, error, clearSelectedOrder } = useOrderStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrderById(Number(id));
    }
    return () => {
      clearSelectedOrder();
    };
  }, [id, fetchOrderById, clearSelectedOrder]);

  const handleConfirm = async () => {
    if (selectedOrder) {
      try {
        await confirmOrder(selectedOrder.idPedido);
        setSuccessMsg('¡Pedido confirmado exitosamente!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch {
        // Error manejado en el store
      }
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

  if (error || !selectedOrder) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
        <p className="text-destructive font-semibold">{error || 'Pedido no encontrado'}</p>
        <Link to="/orders">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            Volver a Mis Pedidos
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'shipped':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'delivered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 border rounded-full ${getStatusStyle(selectedOrder.estado)}`}>
            {selectedOrder.estado}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle className="size-4" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold">Motos Solicitadas</h2>
          {(selectedOrder.carrito?.items || []).map((item) => (
            <Card key={item.idItem} className="border-border/40">
              <CardContent className="p-4 flex justify-between items-center gap-4">
                <div className="flex gap-3 items-center">
                  <span className="text-2xl bg-muted p-2 rounded-xl">🏍️</span>
                  <div>
                    <h4 className="font-bold text-sm">Moto ID: {item.idMoto}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.cantidad} x {formatPrice(item.precioUnitario)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">{formatPrice(item.subtotal)}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Summary */}
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
            {selectedOrder.estado === 'pending' && (
              <CardFooter className="pt-2">
                <Button className="w-full gap-2 font-semibold shadow-xs" onClick={handleConfirm}>
                  <CreditCard className="size-4" />
                  Confirmar Pedido
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
