// src/presentation/pages/admin/PagosAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { usePagoStore } from '../../store/pago.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import type { PagoEstado, PagoMetodo } from '../../../domain/entities/pago.entity';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  DollarSign,
  ListChecks,
  Plus,
  Search,
  Trash2,
  X,
  Wallet,
  ReceiptText,
  ArrowLeftRight,
  Coins,
  HelpCircle,
  Pencil,
} from 'lucide-react';

/* ─── helpers ─── */
const METODO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  credito: 'Crédito',
  otro: 'Otro',
};

const METODO_ICONS: Record<string, React.ReactNode> = {
  efectivo: <Coins className="size-3.5" />,
  tarjeta: <CreditCard className="size-3.5" />,
  transferencia: <ArrowLeftRight className="size-3.5" />,
  credito: <Wallet className="size-3.5" />,
  otro: <HelpCircle className="size-3.5" />,
};

const ESTADO_CYCLES: PagoEstado[] = ['pendiente', 'completado', 'fallido', 'reembolsado'];

/* ─── form defaults ─── */
interface PagoFormData {
  id_venta: string;
  monto: string;
  metodo_pago: PagoMetodo;
  estado: PagoEstado;
  referencia: string;
}

const EMPTY_FORM: PagoFormData = {
  id_venta: '',
  monto: '',
  metodo_pago: 'efectivo',
  estado: 'pendiente',
  referencia: '',
};

/* ═══════════════════════════════════════════════════════════ */
export default function PagosAdminPage() {
  const {
    pagos,
    stats,
    count,
    filters,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchPagos,
    fetchStats,
    createPago,
    updatePago,
    updatePagoStatus,
    deletePago,
    setFilters,
    clearMessages,
    selectedPago,
    fetchPagoById,
    clearSelectedPago,
  } = usePagoStore();

  const [search, setSearch]           = useState(filters.search ?? '');
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [formData, setFormData]       = useState<PagoFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState<Partial<PagoFormData>>({});

  const page      = filters.page ?? 1;
  const pageSize  = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  /* ── load ── */
  const loadData = useCallback(async () => {
    await Promise.all([fetchPagos(), fetchStats()]);
  }, [fetchPagos, fetchStats]);

  useEffect(() => {
    loadData();
    return () => { clearMessages(); };
  }, [loadData, clearMessages]);

  /* ── form population when editing ── */
  useEffect(() => {
    if (selectedPago) {
      setFormData({
        id_venta:    String(selectedPago.id_venta),
        monto:       String(selectedPago.monto),
        metodo_pago: selectedPago.metodo_pago,
        estado:      selectedPago.estado,
        referencia:  selectedPago.referencia,
      });
    }
  }, [selectedPago]);

  /* ── search ── */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchPagos({ search, page: 1 });
  };

  /* ── pagination ── */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters({ page: newPage });
      fetchPagos({ page: newPage });
    }
  };

  /* ── delete ── */
  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este pago?')) {
      const ok = await deletePago(id);
      if (ok) loadData();
    }
  };

  /* ── status cycle ── */
  const handleStatusCycle = async (id: number, current: string) => {
    const idx = ESTADO_CYCLES.indexOf(current as PagoEstado);
    const next = ESTADO_CYCLES[(idx + 1) % ESTADO_CYCLES.length];
    if (confirm(`¿Cambiar el estado del pago a "${next}"?`)) {
      await updatePagoStatus(id, next);
    }
  };

  /* ── open edit ── */
  const handleOpenEdit = async (id: number) => {
    setEditingId(id);
    setFormErrors({});
    await fetchPagoById(id);
    setShowForm(true);
  };

  /* ── open create ── */
  const handleOpenCreate = () => {
    setEditingId(null);
    clearSelectedPago();
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  };

  /* ── close form ── */
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    clearSelectedPago();
    setFormData(EMPTY_FORM);
    setFormErrors({});
    clearMessages();
  };

  /* ── form validation ── */
  const validateForm = (): boolean => {
    const errs: Partial<PagoFormData> = {};
    if (!formData.id_venta || isNaN(Number(formData.id_venta)))
      errs.id_venta = 'Ingrese un ID de venta válido';
    if (!formData.monto || isNaN(Number(formData.monto)) || Number(formData.monto) <= 0)
      errs.monto = 'El monto debe ser mayor a 0';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── form submit ── */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      id_venta:    Number(formData.id_venta),
      monto:       Number(formData.monto),
      metodo_pago: formData.metodo_pago,
      estado:      formData.estado,
      referencia:  formData.referencia,
    };

    let ok: boolean;
    if (editingId !== null) {
      ok = await updatePago(editingId, payload);
    } else {
      ok = await createPago(payload);
    }
    if (ok) {
      handleCloseForm();
      loadData();
    }
  };

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">
            Módulo de Pagos
          </h1>
          <p className="text-muted-foreground text-sm">
            Registra, supervisa y gestiona todos los pagos asociados a ventas
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs gap-2 shrink-0"
        >
          <Plus className="size-4" />
          Nuevo Pago
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
        <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total Pagos
                </p>
                <h3 className="text-2xl font-black text-foreground mt-1">{stats.total_pagos}</h3>
              </div>
              <ListChecks className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Monto Total
                </p>
                <h3 className="text-2xl font-black text-primary mt-1">
                  {formatPrice(stats.monto_total)}
                </h3>
              </div>
              <DollarSign className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Completados
                </p>
                <h3 className="text-2xl font-black text-green-400 mt-1">
                  {stats.por_estado.completado ?? 0}
                </h3>
              </div>
              <CheckCircle2 className="size-8 text-green-400/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Pendientes
                </p>
                <h3 className="text-2xl font-black text-yellow-400 mt-1">
                  {stats.por_estado.pendiente ?? 0}
                </h3>
              </div>
              <ReceiptText className="size-8 text-yellow-400/40" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Search & Filter Bar ── */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row gap-3 bg-muted/30 border border-border/30 p-4 rounded-xl"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por referencia o método de pago..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <select
          value={filters.metodo_pago || ''}
          onChange={(e) => {
            const val = e.target.value || undefined;
            setFilters({ metodo_pago: val, page: 1 });
            fetchPagos({ metodo_pago: val, page: 1 });
          }}
          className="bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Todos los Métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
          <option value="credito">Crédito</option>
          <option value="otro">Otro</option>
        </select>

        <select
          value={filters.estado || ''}
          onChange={(e) => {
            const val = e.target.value || undefined;
            setFilters({ estado: val, page: 1 });
            fetchPagos({ estado: val, page: 1 });
          }}
          className="bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Todos los Estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="fallido">Fallido</option>
          <option value="reembolsado">Reembolsado</option>
        </select>

        <Button
          type="submit"
          className="bg-muted hover:bg-neutral-700 text-foreground font-bold rounded-lg text-xs uppercase tracking-wider px-6"
        >
          Buscar
        </Button>
      </form>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : pagos.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <ReceiptText className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No se encontraron pagos</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Intente ajustar los filtros o registre un nuevo pago
          </p>
          <Button
            onClick={handleOpenCreate}
            className="mt-6 bg-primary/90 hover:bg-primary text-primary-foreground gap-2 text-xs font-bold uppercase"
          >
            <Plus className="size-4" /> Nuevo Pago
          </Button>
        </div>
      ) : (
        <Card className="border-border/30 bg-muted/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="w-[110px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.map((pago) => (
                  <TableRow
                    key={pago.id_pago}
                    className="hover:bg-muted/20 border-b border-border/20"
                  >
                    <TableCell className="font-mono font-bold text-muted-foreground">
                      #{pago.id_pago}
                    </TableCell>
                    <TableCell className="font-mono">#{pago.id_venta}</TableCell>
                    <TableCell className="text-right font-black text-primary">
                      {formatPrice(pago.monto)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium text-xs bg-muted/60 px-2.5 py-1 rounded-full border border-border/20">
                        {METODO_ICONS[pago.metodo_pago]}
                        {METODO_LABELS[pago.metodo_pago] ?? pago.metodo_pago}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={pago.estado} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(pago.fecha_pago)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[140px] truncate">
                      {pago.referencia || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        {/* Cycle status */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleStatusCycle(pago.id_pago, pago.estado)}
                          title="Cambiar Estado"
                          className="text-primary hover:bg-primary/10"
                        >
                          <ArrowLeftRight className="size-4" />
                        </Button>
                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(pago.id_pago)}
                          title="Editar Pago"
                          className="text-blue-400 hover:bg-blue-500/10"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(pago.id_pago)}
                          title="Eliminar Pago"
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 px-6 py-4 bg-background/40">
              <span className="text-xs text-muted-foreground font-semibold">
                Página <span className="text-foreground">{page}</span> de{' '}
                <span className="text-foreground">{totalPages}</span> — {count} registros
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

      {/* ══════════════════ MODAL FORM ══════════════════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseForm}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <CreditCard className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground tracking-tight">
                    {editingId !== null ? 'Editar Pago' : 'Registrar Nuevo Pago'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {editingId !== null
                      ? `Pago #${editingId}`
                      : 'Completa los campos para registrar el pago'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCloseForm}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Error inside form */}
              {error && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* ID Venta */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  ID de Venta <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Ej: 1"
                  value={formData.id_venta}
                  onChange={(e) => setFormData((p) => ({ ...p, id_venta: e.target.value }))}
                  className={`w-full bg-background border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${
                    formErrors.id_venta
                      ? 'border-destructive focus:border-destructive'
                      : 'border-border/30 focus:border-primary'
                  }`}
                />
                {formErrors.id_venta && (
                  <p className="text-xs text-destructive">{formErrors.id_venta}</p>
                )}
              </div>

              {/* Monto */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Monto <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.monto}
                    onChange={(e) => setFormData((p) => ({ ...p, monto: e.target.value }))}
                    className={`w-full bg-background border rounded-lg pl-8 pr-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${
                      formErrors.monto
                        ? 'border-destructive focus:border-destructive'
                        : 'border-border/30 focus:border-primary'
                    }`}
                  />
                </div>
                {formErrors.monto && (
                  <p className="text-xs text-destructive">{formErrors.monto}</p>
                )}
              </div>

              {/* Método de Pago + Estado (2 cols) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Método de Pago <span className="text-primary">*</span>
                  </label>
                  <select
                    value={formData.metodo_pago}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, metodo_pago: e.target.value as PagoMetodo }))
                    }
                    className="w-full bg-background border border-border/30 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="credito">Crédito</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Estado <span className="text-primary">*</span>
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, estado: e.target.value as PagoEstado }))
                    }
                    className="w-full bg-background border border-border/30 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                    <option value="fallido">Fallido</option>
                    <option value="reembolsado">Reembolsado</option>
                  </select>
                </div>
              </div>

              {/* Referencia */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Referencia{' '}
                  <span className="text-neutral-500 font-normal normal-case tracking-normal">
                    (opcional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Número de transacción, voucher, etc."
                  value={formData.referencia}
                  onChange={(e) => setFormData((p) => ({ ...p, referencia: e.target.value }))}
                  className="w-full bg-background border border-border/30 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  className="flex-1 border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider gap-2"
                >
                  {isSaving ? (
                    <span className="animate-pulse">Guardando…</span>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      {editingId !== null ? 'Actualizar' : 'Registrar Pago'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
