// src/presentation/pages/admin/VentasAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useVentaStore } from '../../store/venta.store';
import { useOrderStore } from '../../store/order.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
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
  AlertCircle
} from 'lucide-react';

interface VentaFormState {
  id_pedido: string;
  total_venta: string;
  estado: 'pendiente' | 'completada' | 'anulada';
}

interface FinanciarFormState {
  entidad_financiera: string;
  monto_financiado: string;
  tasa_interes: string;
  plazo_meses: string;
  cuota_mensual: string;
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
  } = useVentaStore();

  const { orders, fetchOrders } = useOrderStore();

  const [search, setSearch] = useState(filters.search ?? '');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFinanciarOpen, setIsFinanciarOpen] = useState(false);
  const [selectedVentaId, setSelectedVentaId] = useState<number | null>(null);

  // Form States
  const [ventaForm, setVentaForm] = useState<VentaFormState>({
    id_pedido: '',
    total_venta: '',
    estado: 'completada',
  });

  const [financiarForm, setFinanciarForm] = useState<FinanciarFormState>({
    entidad_financiera: '',
    monto_financiado: '',
    tasa_interes: '12.00',
    plazo_meses: '24',
    cuota_mensual: '',
    estado: 'activo',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchVentas(),
      fetchStats(),
      fetchOrders(100, 0, 'confirmed'), // Carga pedidos confirmados
    ]);
  }, [fetchVentas, fetchStats, fetchOrders]);

  useEffect(() => {
    loadData();
    return () => {
      clearMessages();
    };
  }, [loadData, clearMessages]);

  // Auto-fill price when selecting an order
  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.idPedido === Number(orderId));
    setVentaForm(prev => ({
      ...prev,
      id_pedido: orderId,
      total_venta: order ? String(order.total) : '',
    }));
  };

  // Auto-calculate cuota mensual for financing
  useEffect(() => {
    const monto = Number(financiarForm.monto_financiado);
    const tasa = Number(financiarForm.tasa_interes);
    const plazo = Number(financiarForm.plazo_meses);

    if (monto > 0 && tasa >= 0 && plazo > 0) {
      // Cuota nivelada con interés compuesto mensual simplificado
      const tasaMensual = (tasa / 100) / 12;
      let cuota = 0;
      if (tasaMensual === 0) {
        cuota = monto / plazo;
      } else {
        cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));
      }
      setFinanciarForm(prev => ({
        ...prev,
        cuota_mensual: cuota.toFixed(2),
      }));
    } else {
      setFinanciarForm(prev => ({
        ...prev,
        cuota_mensual: '',
      }));
    }
  }, [financiarForm.monto_financiado, financiarForm.tasa_interes, financiarForm.plazo_meses]);

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
    setFormErrors({});

    if (!ventaForm.id_pedido) {
      setFormErrors(prev => ({ ...prev, id_pedido: 'Debe seleccionar un pedido.' }));
      return;
    }
    if (!ventaForm.total_venta || Number(ventaForm.total_venta) <= 0) {
      setFormErrors(prev => ({ ...prev, total_venta: 'El total de venta debe ser mayor a 0.' }));
      return;
    }

    const success = await createVenta({
      id_pedido: Number(ventaForm.id_pedido),
      total_venta: Number(ventaForm.total_venta).toFixed(2),
      estado: ventaForm.estado,
    });

    if (success) {
      setIsCreateOpen(false);
      setVentaForm({ id_pedido: '', total_venta: '', estado: 'completada' });
      loadData();
    }
  };

  const submitFinanciamiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!selectedVentaId) return;

    const monto = Number(financiarForm.monto_financiado);
    const tasa = Number(financiarForm.tasa_interes);
    const plazo = Number(financiarForm.plazo_meses);
    const cuota = Number(financiarForm.cuota_mensual);

    if (!financiarForm.entidad_financiera.trim()) {
      setFormErrors(prev => ({ ...prev, entidad_financiera: 'Especifique la entidad financiera.' }));
      return;
    }
    if (monto <= 0) {
      setFormErrors(prev => ({ ...prev, monto_financiado: 'El monto debe ser mayor a 0.' }));
      return;
    }
    if (tasa <= 0 || tasa > 100) {
      setFormErrors(prev => ({ ...prev, tasa_interes: 'La tasa debe estar entre 0 y 100.' }));
      return;
    }
    if (plazo <= 0) {
      setFormErrors(prev => ({ ...prev, plazo_meses: 'El plazo debe ser mayor a 0.' }));
      return;
    }

    const success = await financiarVenta(selectedVentaId, {
      entidad_financiera: financiarForm.entidad_financiera,
      monto_financiado: monto,
      tasa_interes: tasa,
      plazo_meses: plazo,
      cuota_mensual: cuota,
      estado: financiarForm.estado,
    });

    if (success) {
      setIsFinanciarOpen(false);
      setFinanciarForm({
        entidad_financiera: '',
        monto_financiado: '',
        tasa_interes: '12.00',
        plazo_meses: '24',
        cuota_mensual: '',
        estado: 'activo',
      });
      loadData();
    }
  };

  const handleAnnulVenta = async (id: number) => {
    if (confirm('¿Está seguro de que desea anular esta venta?')) {
      await deleteVenta(id);
      loadData();
    }
  };

  const handleStatusChange = async (id: number, currentEstado: string) => {
    const nextEstado = currentEstado === 'pendiente' ? 'completada' : 'anulada';
    if (confirm(`¿Cambiar el estado de la venta a ${nextEstado}?`)) {
      await updateVentaStatus(id, nextEstado as any);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">Gestión de Ventas</h1>
          <p className="text-muted-foreground text-sm">Registra y administra las ventas de motocicletas a partir de pedidos</p>
        </div>
        <Button
          onClick={() => {
            clearMessages();
            setIsCreateOpen(true);
          }}
          className="gap-2 bg-primary hover:bg-primary/95 font-bold rounded-lg text-xs uppercase tracking-wider py-5"
        >
          <Plus className="size-4" />
          Registrar Venta
        </Button>
      </div>

      {/* Messages */}
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

      {/* Stats Cards */}
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

      {/* Filter and Search Bar */}
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

      {/* Table Section */}
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
                          onClick={() => handleStatusChange(venta.id_venta, venta.estado)}
                          title="Marcar como Completada"
                          className="text-green-400 hover:bg-green-500/10"
                        >
                          <Edit className="size-4" />
                        </Button>
                      )}
                      {venta.estado !== 'anulada' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setSelectedVentaId(venta.id_venta);
                            setFinanciarForm(prev => ({
                              ...prev,
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
                          onClick={() => handleAnnulVenta(venta.id_venta)}
                          title="Anular Venta"
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

          {/* Pagination Controls */}
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

      {/* MODAL: Registrar Venta */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-background border border-border/40 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
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
                    value={ventaForm.id_pedido}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Elija un Pedido --</option>
                    {orders.filter(o => o.estado === 'confirmed').map(o => (
                      <option key={o.idPedido} value={o.idPedido}>
                        Pedido #{o.idPedido} — Cliente: {o.usernameCliente} ({formatPrice(o.total)})
                      </option>
                    ))}
                  </select>
                  {formErrors.id_pedido && <p className="text-destructive text-xs mt-1">{formErrors.id_pedido}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={ventaForm.total_venta}
                    onChange={(e) => setVentaForm(prev => ({ ...prev, total_venta: e.target.value }))}
                    className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                  />
                  {formErrors.total_venta && <p className="text-destructive text-xs mt-1">{formErrors.total_venta}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Estado Inicial</label>
                  <select
                    value={ventaForm.estado}
                    onChange={(e) => setVentaForm(prev => ({ ...prev, estado: e.target.value as any }))}
                    className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-2 p-5 border-t border-border/30 bg-muted/20">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-lg text-xs py-4 px-5 font-bold uppercase tracking-wider">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-lg text-xs py-4 px-5 uppercase tracking-wider">
                  {isSaving ? 'Registrando...' : 'Confirmar Venta'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: Financiar Venta */}
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
                    onChange={(e) => setFinanciarForm(prev => ({ ...prev, entidad_financiera: e.target.value }))}
                    className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                  {formErrors.entidad_financiera && <p className="text-destructive text-xs mt-1">{formErrors.entidad_financiera}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Monto Financiado ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={financiarForm.monto_financiado}
                      onChange={(e) => setFinanciarForm(prev => ({ ...prev, monto_financiado: e.target.value }))}
                      className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                    />
                    {formErrors.monto_financiado && <p className="text-destructive text-xs mt-1">{formErrors.monto_financiado}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tasa Interés Anual (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={financiarForm.tasa_interes}
                      onChange={(e) => setFinanciarForm(prev => ({ ...prev, tasa_interes: e.target.value }))}
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
                      onChange={(e) => setFinanciarForm(prev => ({ ...prev, plazo_meses: e.target.value }))}
                      className="w-full bg-muted border border-border/30 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                    />
                    {formErrors.plazo_meses && <p className="text-destructive text-xs mt-1">{formErrors.plazo_meses}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cuota Estimada (Auto-calc)</label>
                    <input
                      type="text"
                      disabled
                      value={formatPrice(Number(financiarForm.cuota_mensual) || 0)}
                      className="w-full bg-muted/60 border border-border/20 rounded-lg px-3.5 py-2.5 text-sm text-primary font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Estado Inicial</label>
                  <select
                    value={financiarForm.estado}
                    onChange={(e) => setFinanciarForm(prev => ({ ...prev, estado: e.target.value as any }))}
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
