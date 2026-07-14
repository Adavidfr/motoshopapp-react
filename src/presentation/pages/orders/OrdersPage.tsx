// src/presentation/pages/orders/OrdersPage.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '../../store/order.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Eye, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const { orders, fetchOrders, isLoading, error } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Mis Pedidos</h1>
        <p className="text-muted-foreground text-sm">
          Consulta el historial y estado de todas tus compras de motocicletas
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <Card className="border-border/40">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 space-y-6 bg-muted/10 border border-border/40 rounded-2xl">
          <div className="text-5xl">📋</div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">No tienes pedidos</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Aún no has registrado ninguna compra en tu cuenta.
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
        <Card className="border-border/40 shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Pedido ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.idPedido}>
                  <TableCell className="font-mono font-bold">#{order.idPedido}</TableCell>
                  <TableCell>{formatDate(order.fechaPedido)}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${getStatusStyle(order.estado)}`}>
                      {order.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell>
                    <Link to={`/orders/${order.idPedido}`}>
                      <Button variant="ghost" size="icon-sm" className="hover:text-primary">
                        <Eye className="size-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
