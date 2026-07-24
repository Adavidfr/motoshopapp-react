// src/presentation/pages/orders/OrderDetailPage.tsx
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../../store/order.store';
import { useVentaStore } from '../../store/venta.store';
import { useDevolucionStore } from '../../store/devolucion.store';
import { useAuthStore } from '../../store/auth.store';
import { useLineItemProducts } from '../../hooks/use-line-item-products';
import { CartLineItem } from '../../components/cart/CartLineItem';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice, formatDate } from '../../utils/formatters';
import {
  ArrowLeft, CheckCircle, CreditCard, AlertCircle, Undo2, X,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import type { PedidoEstado } from '../../../domain/entities/order.entity';
import { DEVOLUCION_PLAZO_DIAS } from '../../../domain/entities/devolucion.entity';

function statusMessage(estado: PedidoEstado): string {
  switch (estado) {
    case 'pending':
      return 'Tu pedido está pendiente de confirmación.';
    case 'confirmed':
      return 'Tu pedido fue confirmado y está en preparación.';
    case 'shipped':
      return 'Tu pedido fue enviado.';
    case 'delivered':
      return 'Tu pedido fue entregado.';
    case 'cancelled':
      return 'Tu pedido fue cancelado.';
    default:
      return '';
  }
}

function isWithinDevolucionPlazo(fechaVenta: string): boolean {
  const inicio = new Date(fechaVenta).getTime();
  if (Number.isNaN(inicio)) return false;
  const limite = inicio + DEVOLUCION_PLAZO_DIAS * 24 * 60 * 60 * 1000;
  return Date.now() <= limite;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
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
  const { ventas, fetchVentas } = useVentaStore();
  const {
    fetchDevoluciones,
    createDevolucion,
    ventaTieneDevolucionAbierta,
    isSaving: isSavingDevolucion,
    error: devolucionError,
    successMessage: devolucionSuccess,
    clearMessages: clearDevolucionMessages,
  } = useDevolucionStore();

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [montoDevolucion, setMontoDevolucion] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const orderItems = selectedOrder?.carrito?.items ?? [];
  const lineItemProducts = useLineItemProducts(orderItems);

  useEffect(() => {
    if (id) {
      void fetchOrderById(Number(id));
    }
    void fetchVentas({ pageSize: 100 });
    void fetchDevoluciones({ pageSize: 100 });
    return () => {
      clearSelectedOrder();
      clearError();
      clearDevolucionMessages();
    };
  }, [
    id,
    fetchOrderById,
    fetchVentas,
    fetchDevoluciones,
    clearSelectedOrder,
    clearError,
    clearDevolucionMessages,
  ]);

  const ventaDelPedido = useMemo(() => {
    if (!selectedOrder) return null;
    return (
      ventas.find(
        (v) =>
          v.id_pedido === selectedOrder.idPedido &&
          v.estado !== 'anulada' &&
          (user ? v.id_usuario_cliente === user.id : true),
      ) ?? null
    );
  }, [ventas, selectedOrder, user]);

  const hasOpenReturn = ventaDelPedido
    ? ventaTieneDevolucionAbierta(ventaDelPedido.id_venta)
    : false;

  const productosElegibles = (selectedOrder?.carrito?.items?.length ?? 0) > 0;

  const canRequestReturn =
    selectedOrder?.estado === 'delivered' &&
    !!ventaDelPedido &&
    !!user &&
    ventaDelPedido.id_usuario_cliente === user.id &&
    productosElegibles &&
    isWithinDevolucionPlazo(ventaDelPedido.fecha_venta) &&
    !hasOpenReturn;

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

  const openReturnForm = () => {
    if (!ventaDelPedido) return;
    setFormError(null);
    clearDevolucionMessages();
    setMotivo('');
    setMontoDevolucion(String(ventaDelPedido.total_venta));
    setShowReturnForm(true);
  };

  const handleSubmitReturn = async (e: FormEvent) => {
    e.preventDefault();
    if (!ventaDelPedido || isSavingDevolucion) return;

    const motivoTrim = motivo.trim();
    if (!motivoTrim) {
      setFormError('El motivo es obligatorio.');
      return;
    }

    const monto = Number(montoDevolucion);
    if (Number.isNaN(monto) || monto < 0) {
      setFormError('El monto solicitado no puede ser negativo.');
      return;
    }

    setFormError(null);
    const ok = await createDevolucion({
      id_venta: ventaDelPedido.id_venta,
      motivo: motivoTrim,
      monto_devolucion: monto,
    });

    if (ok) {
      setShowReturnForm(false);
      setSuccessMsg('Solicitud de devolución registrada (pendiente de revisión).');
      setTimeout(() => setSuccessMsg(null), 5000);
      void fetchDevoluciones({ pageSize: 100 });
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

      {(error || devolucionError || formError) && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          {formError || devolucionError || error}
        </div>
      )}

      {(successMsg || devolucionSuccess) && (
        <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle className="size-4" />
          {successMsg || devolucionSuccess}
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

            <CardFooter className="flex-col gap-3 pt-4 border-t border-border/40 items-stretch">
              <p className="text-sm text-muted-foreground w-full">
                {statusMessage(selectedOrder.estado)}
              </p>

              {canConfirm && (
                <>
                  <p className="text-sm text-muted-foreground w-full">
                    Confirma tu pedido para que el equipo lo procese. El pago se registrará posteriormente.
                  </p>
                  <Button
                    className="w-full gap-2 font-semibold shadow-xs"
                    onClick={() => void handleConfirm()}
                    disabled={isConfirming}
                  >
                    <CreditCard className="size-4" />
                    {isConfirming ? 'Confirmando...' : 'Confirmar Pedido'}
                  </Button>
                </>
              )}

              {canRequestReturn && !showReturnForm && (
                <Button
                  variant="outline"
                  className="w-full gap-2 font-semibold"
                  onClick={openReturnForm}
                >
                  <Undo2 className="size-4" />
                  Solicitar devolución
                </Button>
              )}

              {selectedOrder.estado === 'delivered' && !canRequestReturn && hasOpenReturn && (
                <p className="text-xs text-muted-foreground">
                  Ya existe una devolución pendiente o en proceso para esta venta.
                </p>
              )}

              {selectedOrder.estado === 'delivered' && !canRequestReturn && !ventaDelPedido && (
                <p className="text-xs text-muted-foreground">
                  No hay una venta válida asociada para solicitar devolución.
                </p>
              )}
            </CardFooter>
          </Card>

          {showReturnForm && ventaDelPedido && (
            <Card className="border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-bold">Solicitar devolución</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setShowReturnForm(false);
                    setFormError(null);
                  }}
                >
                  <X className="size-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => void handleSubmitReturn(e)}>
                  <p className="text-xs text-muted-foreground">
                    Devolución total de la venta #{ventaDelPedido.id_venta}. El stock y el reembolso se procesan al aprobar en admin.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Venta
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`#${ventaDelPedido.id_venta} — ${formatPrice(ventaDelPedido.total_venta)}`}
                      className="w-full rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="motivo" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Motivo
                    </label>
                    <textarea
                      id="motivo"
                      required
                      rows={3}
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
                      placeholder="Describe el motivo de la devolución"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="monto" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Monto solicitado
                    </label>
                    <input
                      id="monto"
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={montoDevolucion}
                      onChange={(e) => setMontoDevolucion(e.target.value)}
                      className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Usa 0 para devolución física sin reembolso. Máximo: lo pagado / total de venta.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSavingDevolucion}
                  >
                    <Undo2 className="size-4" />
                    {isSavingDevolucion ? 'Enviando...' : 'Enviar solicitud'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
