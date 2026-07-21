// src/presentation/pages/orders/OrdersPage.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '../../store/order.store';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { Eye, ShoppingBag, Package, ArrowRight, AlertCircle } from 'lucide-react';

export default function OrdersPage() {
  const { orders, fetchOrders, isLoading, error } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-[80vh] bg-background text-foreground py-10 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Package className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Mis Pedidos</h1>
              <p className="text-neutral-500 text-sm font-medium">
                Historial y estado de todas tus compras
              </p>
            </div>
          </div>

          {orders.length > 0 && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 border border-white/[0.06] rounded-xl px-4 py-2">
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl font-medium">
            <AlertCircle className="size-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="size-24 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Package className="size-10 text-neutral-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Sin Pedidos</h2>
              <p className="text-neutral-500 text-sm max-w-xs">
                Aún no has registrado ninguna compra. ¡Encuentra tu próxima moto!
              </p>
            </div>
            <Link to="/">
              <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold uppercase text-xs tracking-widest px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)] hover:-translate-y-0.5 cursor-pointer">
                <ShoppingBag className="size-4" />
                Explorar Catálogo
              </button>
            </Link>
          </div>
        ) : (
          /* Orders Table */
          <div className="space-y-3">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-[1fr_2fr_2fr_2fr_auto] gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600">
              <span>ID</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span className="text-right">Total</span>
              <span />
            </div>

            {orders.map((order, idx) => (
              <div
                key={order.idPedido}
                className="bg-card/60 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-border/80 transition-all duration-300 group"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_2fr_2fr_auto] items-center gap-3 sm:gap-4 p-5">
                  {/* ID */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 sm:hidden">Pedido · </span>
                    <span className="font-black text-sm font-mono text-foreground">#{order.idPedido}</span>
                  </div>

                  {/* Date */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 sm:hidden block mb-0.5">Fecha</span>
                    <span className="text-sm font-semibold text-foreground">{formatDate(order.fechaPedido)}</span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 sm:hidden block mb-1">Estado</span>
                    <StatusBadge status={order.estado} />
                  </div>

                  {/* Total */}
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 sm:hidden block mb-0.5">Total</span>
                    <span className="text-lg font-black text-primary">{formatPrice(order.total)}</span>
                  </div>

                  {/* Action */}
                  <Link to={`/orders/${order.idPedido}`} className="justify-self-end">
                    <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-xl px-3 py-2 transition-all duration-300 cursor-pointer group/btn">
                      <Eye className="size-3.5" />
                      <span className="hidden sm:inline">Ver</span>
                      <ArrowRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
