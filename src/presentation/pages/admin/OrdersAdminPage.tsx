import { useEffect, useState, Fragment } from 'react';
import { useOrderStore } from '../../store/order.store';
import type { Pedido, PedidoEstado } from '../../../domain/entities/order.entity';
import { OrderItemsBreakdown } from '../../components/cart/OrderItemsBreakdown';
import { getOrderCompositionFromItems } from '../../utils/order-composition';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import {
  Package, ChevronLeft, ChevronRight, Filter, ChevronDown, ChevronUp,
  Loader2, CheckCircle, Truck, PackageCheck, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

function CompositionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border/50">
      {label}
    </span>
  );
}

/** Acciones logísticas del pedido (independientes de venta/pago/factura). */
function nextLogisticActions(estado: PedidoEstado): Array<{
  estado: PedidoEstado;
  label: string;
  icon: typeof CheckCircle;
}> {
  switch (estado) {
    case 'pending':
      return [{ estado: 'confirmed', label: 'Confirmar', icon: CheckCircle }];
    case 'confirmed':
      return [{ estado: 'shipped', label: 'Enviar', icon: Truck }];
    case 'shipped':
      return [{ estado: 'delivered', label: 'Entregar', icon: PackageCheck }];
    default:
      return [];
  }
}

export default function OrdersAdminPage() {
  const {
    orders,
    selectedOrder,
    isLoading,
    isUpdatingStatus,
    error,
    successMessage,
    fetchOrders,
    fetchOrderById,
    updateOrderStatus,
    clearMessages,
  } = useOrderStore();

  const [page, setPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [detailOrder, setDetailOrder] = useState<Pedido | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const limit = 10;

  useEffect(() => {
    fetchOrders({ page, limit });
  }, [page, fetchOrders, limit]);

  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  useEffect(() => {
    if (
      expandedOrderId !== null &&
      selectedOrder?.idPedido === expandedOrderId &&
      selectedOrder.carrito?.items
    ) {
      setDetailOrder(selectedOrder);
      setDetailLoading(false);
    }
  }, [expandedOrderId, selectedOrder]);

  const hasNextPage = orders.length === limit;

  const handleToggleExpand = async (order: Pedido) => {
    if (expandedOrderId === order.idPedido) {
      setExpandedOrderId(null);
      setDetailOrder(null);
      setDetailLoading(false);
      return;
    }

    setExpandedOrderId(order.idPedido);

    if (order.carrito?.items && order.carrito.items.length > 0) {
      setDetailOrder(order);
      setDetailLoading(false);
      return;
    }

    setDetailLoading(true);
    setDetailOrder(null);
    try {
      await fetchOrderById(order.idPedido);
    } catch {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (order: Pedido, estado: PedidoEstado) => {
    if (isUpdatingStatus) return;
    setUpdatingId(order.idPedido);
    try {
      const updated = await updateOrderStatus(order.idPedido, estado);
      if (detailOrder?.idPedido === order.idPedido) {
        setDetailOrder(updated);
      }
      await fetchOrders({ page, limit });
    } catch {
      // Error en el store
    } finally {
      setUpdatingId(null);
    }
  };

  const resolveOrderForDetail = (order: Pedido): Pedido => {
    const fromList = orders.find((o) => o.idPedido === order.idPedido);
    if (detailOrder?.idPedido === order.idPedido) return detailOrder;
    return fromList ?? order;
  };

  const renderExpandedContent = (order: Pedido) => {
    if (detailLoading) {
      return (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando detalle del pedido...
        </div>
      );
    }

    const orderForDetail = resolveOrderForDetail(order);
    const items = orderForDetail.carrito?.items ?? [];
    const actions = nextLogisticActions(orderForDetail.estado);
    const busy = isUpdatingStatus && updatingId === orderForDetail.idPedido;

    return (
      <div className="space-y-4">
        <OrderItemsBreakdown
          items={items}
          total={orderForDetail.total}
          usernameCliente={orderForDetail.usernameCliente}
          fecha={orderForDetail.fechaPedido}
          estado={orderForDetail.estado}
          showMeta
        />

        <div className="rounded-lg border border-border/40 bg-background/60 p-4 space-y-3">
          <div>
            <p className="text-sm font-bold text-foreground">Estado logístico del pedido</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Independiente de venta, pago o factura. Payload: POST /pedidos/{'{id}'}/update-status/ → {'{ "estado": "..." }'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={orderForDetail.estado} />
            {actions.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                Sin acciones logísticas disponibles (estado terminal).
              </span>
            ) : (
              actions.map(({ estado, label, icon: Icon }) => (
                <Button
                  key={estado}
                  size="sm"
                  className="gap-1.5"
                  disabled={busy}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleUpdateStatus(orderForDetail, estado);
                  }}
                >
                  {busy ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Icon className="size-3.5" />
                  )}
                  {label}
                </Button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Package className="size-6 text-primary" />
            Órdenes de Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión logística de pedidos: confirmar → enviar → entregar. Completar una venta no cambia este estado.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="size-4" />
            Filtrar
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          {successMessage}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[48px]" />
                  <TableHead className="w-[100px]">ID Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Contenido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
                      No hay órdenes registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const live = orders.find((o) => o.idPedido === order.idPedido) ?? order;
                    const items = live.carrito?.items ?? [];
                    const composition = getOrderCompositionFromItems(items);
                    const isExpanded = expandedOrderId === live.idPedido;
                    const actions = nextLogisticActions(live.estado);
                    const busy = isUpdatingStatus && updatingId === live.idPedido;

                    return (
                      <Fragment key={live.idPedido}>
                        <TableRow
                          className="group hover:bg-muted/50 cursor-pointer"
                          onClick={() => void handleToggleExpand(live)}
                        >
                          <TableCell>
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-xs">
                            #{live.idPedido}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">{live.usernameCliente}</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(live.fechaPedido)}
                          </TableCell>
                          <TableCell>
                            {items.length > 0 ? (
                              <CompositionBadge label={composition.label} />
                            ) : (
                              <span className="text-xs text-muted-foreground">Ver detalle</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={live.estado} />
                          </TableCell>
                          <TableCell className="text-right font-bold text-foreground">
                            {formatPrice(live.total)}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {actions.map(({ estado, label, icon: Icon }) => (
                                <Button
                                  key={estado}
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 h-8 text-xs"
                                  disabled={busy}
                                  onClick={() => void handleUpdateStatus(live, estado)}
                                >
                                  {busy ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <Icon className="size-3" />
                                  )}
                                  {label}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/20 hover:bg-muted/20">
                            <TableCell colSpan={8} className="p-4 sm:p-6">
                              {renderExpandedContent(live)}
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!isLoading && orders.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
