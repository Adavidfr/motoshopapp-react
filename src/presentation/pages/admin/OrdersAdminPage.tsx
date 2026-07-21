import { useEffect, useState } from 'react';
import { useOrderStore } from '../../store/order.store';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Package, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function OrdersAdminPage() {
  const { orders, isLoading, error, fetchOrders } = useOrderStore();
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Calculate offset if API supports pagination, assuming fetchOrders(limit, offset)
  const offset = (page - 1) * limit;

  useEffect(() => {
    fetchOrders(limit, offset);
  }, [page, fetchOrders, offset]);

  const hasNextPage = orders.length === limit; // Simple heuristic

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <Package className="size-6 text-primary" />
            Órdenes de Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión y visualización de todos los pedidos ingresados al sistema.
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
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      No hay órdenes registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.idPedido} className="group hover:bg-muted/50 cursor-pointer">
                      <TableCell className="font-mono font-bold text-xs">
                        #{order.idPedido}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{order.usernameCliente}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.fechaPedido)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.estado} />
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {formatPrice(order.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
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
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="size-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
