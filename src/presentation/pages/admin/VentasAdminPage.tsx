// src/presentation/pages/admin/VentasAdminPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useVentaStore } from '../../store/venta.store';
import { useOrderStore } from '../../store/order.store';
import type { VentaEstado } from '../../../domain/entities/venta.entity';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import { OrderItemsBreakdown } from '../../components/cart/OrderItemsBreakdown';
import { getOrderCompositionFromItems } from '../../utils/order-composition';
import {
  ClipboardList,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  CreditCard,
  DollarSign,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

interface FinanciarFormState {
  entidad_financiera: string;
  entrada: string;
  monto_financiado: string;
  tasa_interes: string;
  plazo_meses: string;
  estado: 'activo' | 'pagado' | 'vencido' | 'cancelado';
}

export default function VentasAdminPage() {
  const {
    ventas,
    stats,
    count,
    filters,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchVentas,
    fetchStats,
    createVenta,
    updateVentaStatus,
    deleteVenta,
    financiarVenta,
    setFilters,
    clearMessages,
    pedidoTieneVenta,
  } = useVentaStore();

  const { orders, fetchOrders, fetchOrderById, selectedOrder } = useOrderStore();

  const [search, setSearch] = useState(filters.search ?? '');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFinanciarOpen, setIsFinanciarOpen] = useState(false);
  const [selectedVentaId, setSelectedVentaId] = useState<number | null>(null);
  const [selectedPedidoId, setSelectedPedidoId] = useState('');

  const [financiarForm, setFinanciarForm] = useState<FinanciarFormState>({
    entidad_financiera: '',
    entrada: '0',
    monto_financiado: '',
    tasa_interes: '12.00',
    plazo_meses: '24',
    estado: 'activo',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const pedidosDisponibles = useMemo(
    () => orders.filter(
      (o) => o.estado === 'confirmed' && !pedidoTieneVenta(o.idPedido),
    ),
    [orders, ventas, pedidoTieneVenta],
  );

  const selectedPedido = useMemo(
    () => orders.find((o) => o.idPedido === Number(selectedPedidoId)),
    [orders, selectedPedidoId],
  );

  const selectedPedidoDetail = useMemo(() => {
    if (!selectedPedidoId) {
      return null;
    }
    const id = Number(selectedPedidoId);
    if (selectedOrder?.idPedido === id && selectedOrder.carrito?.items?.length) {
      return selectedOrder;
    }
    if (selectedPedido?.carrito?.items?.length) {
      return selectedPedido;
    }
    return selectedOrder?.idPedido === id ? selectedOrder : selectedPedido ?? null;
  }, [selectedPedidoId, selectedPedido, selectedOrder]);

  useEffect(() => {
    if (!selectedPedidoId) {
      return;
    }
    const id = Number(selectedPedidoId);
    const fromList = orders.find((o) => o.idPedido === id);
    if (fromList?.carrito?.items && fromList.carrito.items.length > 0) {
      return;
    }
    void fetchOrderById(id);
  }, [selectedPedidoId, orders, fetchOrderById]);

  const selectedVenta = useMemo(
    () => ventas.find((v) => v.id_venta === selectedVentaId),
    [ventas, selectedVentaId],
  );

  const cuotaEstimada = useMemo(() => {
    const monto = Number(financiarForm.monto_financiado);
    const tasa = Number(financiarForm.tasa_interes);
    const plazo = Number(financiarForm.plazo_meses);

    if (monto <= 0 || plazo <= 0) return null;

    const tasaMensual = (tasa / 100) / 12;
    if (tasaMensual === 0) return monto / plazo;
    return (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));
  }, [financiarForm.monto_financiado, financiarForm.tasa_interes, financiarForm.plazo_meses]);

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchVentas(),
      fetchStats(),
      fetchOrders({ limit: 100, estado: 'confirmed' }),
    ]);
  }, [fetchVentas, fetchStats, fetchOrders]);

  useEffect(() => {
    loadData();
    return () => {
      clearMessages();
    };
  }, [loadData, clearMessages]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchVentas({ search, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters({ page: newPage });
      fetchVentas({ page: newPage });
    }
  };

  const submitCreateVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFormErrors({});

    const idPedido = Number(selectedPedidoId);
    if (!selectedPedidoId || Number.isNaN(idPedido)) {
      setFormErrors((prev) => ({ ...prev, id_pedido: 'Debe seleccionar un pedido confirmado.' }));
      return;
    }

    if (pedidoTieneVenta(idPedido)) {
      setFormErrors((prev) => ({ ...prev, id_pedido: 'Ya existe una venta registrada para este pedido.' }));
      return;
    }

    const pedido = orders.find((o) => o.idPedido === idPedido);
    if (!pedido || pedido.estado !== 'confirmed') {
      setFormErrors((prev) => ({ ...prev, id_pedido: 'Solo se pueden registrar ventas desde pedidos confirmados.' }));
      return;
    }

    const success = await createVenta({ id_pedido: idPedido });

    if (success) {
      setIsCreateOpen(false);
      setSelectedPedidoId('');
    }
  };

  const submitFinanciamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !selectedVentaId || !selectedVenta) return;

    setFormErrors({});

    const entrada = Number(financiarForm.entrada);
    const monto = Number(financiarForm.monto_financiado);
    const tasa = Number(financiarForm.tasa_interes);
    const plazo = Number(financiarForm.plazo_meses);
    const totalVenta = selectedVenta.total_venta;
    const montoEsperado = totalVenta - entrada;

    if (!financiarForm.entidad_financiera.trim()) {
      setFormErrors((prev) => ({ ...prev, entidad_financiera: 'Especifique la entidad financiera.' }));
      return;
    }
    if (entrada < 0) {
      setFormErrors((prev) => ({ ...prev, entrada: 'La entrada no puede ser negativa.' }));
      return;
    }
    if (entrada >= totalVenta) {
      setFormErrors((prev) => ({ ...prev, entrada: 'La entrada debe ser menor al total de la venta.' }));
      return;
    }
    if (monto <= 0) {
      setFormErrors((prev) => ({ ...prev, monto_financiado: 'El monto financiado debe ser mayor a 0.' }));
      return;
    }
    if (Math.abs(monto - montoEsperado) > 0.01) {
      setFormErrors((prev) => ({
        ...prev,
        monto_financiado: `Debe ser ${formatPrice(montoEsperado)} (total − entrada).`,
      }));
      return;
    }
    if (tasa < 0 || tasa > 100) {
      setFormErrors((prev) => ({ ...prev, tasa_interes: 'La tasa debe estar entre 0 y 100.' }));
      return;
    }
    if (plazo <= 0) {
      setFormErrors((prev) => ({ ...prev, plazo_meses: 'El plazo debe ser mayor a 0.' }));
      return;
    }

    const success = await financiarVenta(selectedVentaId, {
      entidad_financiera: financiarForm.entidad_financiera.trim(),
      monto_financiado: monto,
      entrada,
      tasa_interes: tasa,
      plazo_meses: plazo,
      estado: financiarForm.estado,
    });

    if (success) {
      setIsFinanciarOpen(false);
      setSelectedVentaId(null);
      setFinanciarForm({
        entidad_financiera: '',
        entrada: '0',
        monto_financiado: '',
        tasa_interes: '12.00',
        plazo_meses: '24',
        estado: 'activo',
      });
    }
  };

  const handleAnnulVenta = async (id: number) => {
    if (isSaving) return;
    if (confirm('¿Está seguro de que desea eliminar esta venta?')) {
      await deleteVenta(id);
    }
  };

  const handleStatusChange = async (id: number, currentEstado: VentaEstado) => {
    if (isSaving) return;
    const nextEstado: VentaEstado = currentEstado === 'pendiente' ? 'completada' : 'anulada';
    if (confirm(`¿Cambiar el estado de la venta a ${nextEstado}?`)) {
      await updateVentaStatus(id, nextEstado);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">Gestión de Ventas</h1>
          <p className="text-muted-foreground text-sm">
            Registra ventas a partir de pedidos confirmados que pueden incluir motocicletas, repuestos o ambos.
          </p>
        </div>
        <Button
          onClick={() => {
            clearMessages();
            setSelectedPedidoId('');
            setIsCreateOpen(true);
          }}
          className="gap-2 bg-primary hover:bg-primary/95 font-bold rounded-lg text-xs uppercase tracking-wider py-5"
        >
          <Plus className="size-4" />
          Registrar Venta
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg font-medium">
          {successMessage}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Ventas</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{stats.total_ventas}</h3>
              </div>
              <Briefcase className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ingresos Totales</p>
                <h3 className="text-2xl font-black text-primary mt-1">{formatPrice(stats.total_ingresos)}</h3>
              </div>
              <DollarSign className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completadas</p>
                <h3 className="text-2xl font-black text-green-400 mt-1">{stats.por_estado?.completada || 0}</h3>
              </div>
              <StatusBadge status="completada" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pendientes / Anuladas</p>
                <h3 className="text-2xl font-black text-muted-foreground mt-1">
                  {stats.por_estado?.pendiente || 0} / {stats.por_estado?.anulada || 0}
                </h3>
              </div>
              <div className="flex gap-1.5">
                <StatusBadge status="pendiente" />
                <StatusBadge status="anulada" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 bg-muted/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente o vendedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={filters.estado || ''}
          onChange={(e) => {
            const nextStatus = e.target.value || undefined;
            setFilters({ estado: nextStatus, page: 1 });
            fetchVentas({ estado: nextStatus, page: 1 });
          }}
          className="bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Todos los Estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="anulada">Anulada</option>
        </select>
        <Button type="submit" className="bg-muted hover:bg-neutral-700 text-foreground font-bold rounded-lg text-xs uppercase tracking-wider px-6">
          Buscar
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : ventas.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <ClipboardList className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No se encontraron ventas</h3>
          <p className="text-muted-foreground text-sm mt-1">Intente ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <Card className="border-border/30 bg-muted/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[180px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((venta) => (
                  <TableRow key={venta.id_venta} className="hover:bg-muted/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-muted-foreground">#{venta.id_venta}</TableCell>
                    <TableCell className="font-mono">#{venta.id_pedido}</TableCell>
                    <TableCell className="font-bold text-foreground">{venta.username_cliente}</TableCell>
                    <TableCell className="text-muted-foreground">{venta.username_vendedor || 'Sistema'}</TableCell>
                    <TableCell>{formatDate(venta.fecha_venta)}</TableCell>
                    <TableCell>
                      <StatusBadge status={venta.estado} />
                    </TableCell>
                    <TableCell className="text-right font-black text-primary">
                      {formatPrice(venta.total_venta)}
                    </TableCell>
                    <TableCell className="flex items-center justify-center gap-1.5 py-3">
                      {venta.estado === 'pendiente' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isSaving}
                          onClick={() => handleStatusChange(venta.id_venta, venta.estado)}
                          title="Marcar como Completada"
                          className="text-green-400 hover:bg-green-500/10"
                        >
                          <Edit className="size-4" />
                        </Button>
                      )}
                      {venta.estado !== 'anulada' && venta.num_financiamientos === 0 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isSaving}
                          onClick={() => {
                            setSelectedVentaId(venta.id_venta);
                            setFinanciarForm((prev) => ({
                              ...prev,
                              entrada: '0',
                              monto_financiado: String(venta.total_venta),
                            }));
                            setIsFinanciarOpen(true);
                          }}
                          title="Registrar Financiamiento"
                          className="text-blue-400 hover:bg-blue-500/10"
                        >
                          <CreditCard className="size-4" />
                        </Button>
                      )}
                      {venta.estado !== 'anulada' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isSaving}
                          onClick={() => handleAnnulVenta(venta.id_venta)}
                          title="Eliminar Venta"
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 px-6 py-4 bg-background/40">
              <span className="text-xs text-muted-foreground font-semibold">
                Página <span className="text-foreground">{page}</span> de <span className="text-foreground">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg text-xs"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg text-xs"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border/40 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border/30">
              <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">Registrar Nueva Venta</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={submitCreateVenta}>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Seleccionar Pedido Confirmado</label>
                  <select
                    value={selectedPedidoId}
                    onChange={(e) => setSelectedPedidoId(e.target.value)}
                    className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Elija un Pedido --</option>
                    {pedidosDisponibles.map((o) => {
                      const composition = getOrderCompositionFromItems(o.carrito?.items ?? []);
                      return (
                        <option key={o.idPedido} value={o.idPedido}>
                          Pedido #{o.idPedido} — {o.usernameCliente} — {composition.label} ({formatPrice(o.total)})
                        </option>
                      );
                    })}
                  </select>
                  {pedidosDisponibles.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No hay pedidos confirmados disponibles sin venta registrada.
                    </p>
                  )}
                  {formErrors.id_pedido && <p className="text-destructive text-xs mt-1">{formErrors.id_pedido}</p>}
                </div>

                {selectedPedidoDetail && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border/30 bg-muted/30 p-4 space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        Resumen del pedido #{selectedPedidoDetail.idPedido}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        El total de la venta se asignará automáticamente al crear el registro. Estado inicial: pendiente.
                      </p>
                    </div>

                    <OrderItemsBreakdown
                      items={selectedPedidoDetail.carrito?.items ?? []}
                      total={selectedPedidoDetail.total}
                      usernameCliente={selectedPedidoDetail.usernameCliente}
                      fecha={selectedPedidoDetail.fechaPedido}
                      estado={selectedPedidoDetail.estado}
                      showMeta
                    />
                  </div>
                )}
              </CardContent>
              <div className="flex items-center justify-end gap-2 p-5 border-t border-border/30 bg-muted/20">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-lg text-xs py-4 px-5 font-bold uppercase tracking-wider">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !selectedPedidoId || pedidosDisponibles.length === 0}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-lg text-xs py-4 px-5 uppercase tracking-wider"
                >
                  {isSaving ? 'Registrando...' : 'Confirmar Venta'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isFinanciarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-background border border-border/40 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border/30">
              <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">Registrar Financiamiento</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setIsFinanciarOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </Button>
            </div>
            <form onSubmit={submitFinanciamiento}>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Entidad Financiera</label>
                  <input
                    type="text"
                    placeholder="Ej. Banco Pichincha, Cooperativa JEP"
                    value={financiarForm.entidad_financiera}
                    onChange={(e) => setFinanciarForm((prev) => ({ ...prev, entidad_financiera: e.target.value }))}
                    className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                  {formErrors.entidad_financiera && <p className="text-destructive text-xs mt-1">{formErrors.entidad_financiera}</p>}
                </div>

                {selectedVenta && (
                  <div className="rounded-lg border border-border/30 bg-muted/30 p-3 text-sm">
                    <span className="text-muted-foreground">Total venta: </span>
                    <span className="font-bold text-primary">{formatPrice(selectedVenta.total_venta)}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Entrada / Pago inicial ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={financiarForm.entrada}
                      onChange={(e) => {
                        const entradaVal = e.target.value;
                        const total = selectedVenta?.total_venta ?? 0;
                        const entradaNum = Number(entradaVal) || 0;
                        setFinanciarForm((prev) => ({
                          ...prev,
                          entrada: entradaVal,
                          monto_financiado: total > 0 ? String(Math.max(0, total - entradaNum)) : prev.monto_financiado,
                        }));
                      }}
                      className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                    />
                    {formErrors.entrada && <p className="text-destructive text-xs mt-1">{formErrors.entrada}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Monto Financiado ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={financiarForm.monto_financiado}
                      readOnly
                      className="w-full bg-muted/60 border border-border/20 rounded-lg px-3.5 py-2.5 text-sm text-foreground font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">Calculado: total venta − entrada</p>
                    {formErrors.monto_financiado && <p className="text-destructive text-xs mt-1">{formErrors.monto_financiado}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tasa Interés Anual (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financiarForm.tasa_interes}
                      onChange={(e) => setFinanciarForm((prev) => ({ ...prev, tasa_interes: e.target.value }))}
                      className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                    />
                    {formErrors.tasa_interes && <p className="text-destructive text-xs mt-1">{formErrors.tasa_interes}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Plazo (Meses)</label>
                    <input
                      type="number"
                      value={financiarForm.plazo_meses}
                      onChange={(e) => setFinanciarForm((prev) => ({ ...prev, plazo_meses: e.target.value }))}
                      className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                    />
                    {formErrors.plazo_meses && <p className="text-destructive text-xs mt-1">{formErrors.plazo_meses}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cuota estimada (referencial)</label>
                    <input
                      type="text"
                      disabled
                      value={cuotaEstimada !== null ? formatPrice(cuotaEstimada) : '—'}
                      className="w-full bg-muted/60 border border-border/20 rounded-lg px-3.5 py-2.5 text-sm text-primary font-mono font-bold"
                    />
                    <p className="text-[10px] text-muted-foreground">Calculada por el servidor al registrar.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Estado Inicial</label>
                  <select
                    value={financiarForm.estado}
                    onChange={(e) => setFinanciarForm((prev) => ({ ...prev, estado: e.target.value as FinanciarFormState['estado'] }))}
                    className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="activo">Activo</option>
                    <option value="pagado">Pagado</option>
                    <option value="vencido">Vencido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-2 p-5 border-t border-border/30 bg-muted/20">
                <Button type="button" variant="outline" onClick={() => setIsFinanciarOpen(false)} className="rounded-lg text-xs py-4 px-5 font-bold uppercase tracking-wider">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-lg text-xs py-4 px-5 uppercase tracking-wider">
                  {isSaving ? 'Registrando...' : 'Aceptar Financiamiento'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
