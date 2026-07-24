// src/presentation/pages/admin/PagosAdminPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePagoStore } from '../../store/pago.store';
import { useFacturaStore } from '../../store/factura.store';
import { useVentaStore } from '../../store/venta.store';
import type { Venta } from '../../../domain/entities/venta.entity';
import type { Pago, PagoMetodo, PagoTipo } from '../../../domain/entities/pago.entity';
import type { Factura } from '../../../domain/entities/factura.entity';
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
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  DollarSign,
  ListChecks,
  Plus,
  Search,
  X,
  Wallet,
  ReceiptText,
  ArrowLeftRight,
  Coins,
  HelpCircle,
  Receipt,
  FileText,
  Eye,
} from 'lucide-react';

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

const TIPO_PAGO_LABELS: Record<PagoTipo, string> = {
  contado: 'Contado',
  entrada: 'Entrada',
  cuota: 'Cuota',
  abono: 'Abono',
  reembolso: 'Reembolso',
};

function getSaldoPendiente(venta: Venta): number {
  if (venta.saldo_pendiente !== undefined) return venta.saldo_pendiente;
  const pagado = venta.total_pagado ?? 0;
  return Math.max(0, venta.total_venta - pagado);
}

function isVentaPagable(venta: Venta): boolean {
  if (venta.estado === 'anulada' || venta.estado === 'completada') return false;
  return getSaldoPendiente(venta) > 0;
}

function pagoEstaFacturado(pago: Pago): boolean {
  return pago.factura !== null;
}

function puedeEmitirFactura(pago: Pago): boolean {
  if (pago.estado !== 'completado') return false;
  if (pago.tipo_pago === 'reembolso') return false;
  if (pagoEstaFacturado(pago)) return false;
  return true;
}

interface PagoFormData {
  id_venta: string;
  monto: string;
  metodo_pago: PagoMetodo;
  tipo_pago: PagoTipo;
  referencia: string;
  id_financiamiento: string;
}

const EMPTY_FORM: PagoFormData = {
  id_venta: '',
  monto: '',
  metodo_pago: 'efectivo',
  tipo_pago: 'contado',
  referencia: '',
  id_financiamiento: '',
};

export default function PagosAdminPage() {
  const navigate = useNavigate();

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
    patchPagoFactura,
    setFilters,
    clearMessages,
  } = usePagoStore();

  const {
    selectedFactura,
    isSaving: isSavingFactura,
    error: facturaError,
    createFactura,
    fetchFacturaById,
    fetchFacturas,
    clearSelectedFactura,
    clearMessages: clearFacturaMessages,
  } = useFacturaStore();

  const { ventas, fetchVentas, fetchStats: fetchVentaStats } = useVentaStore();

  const [search, setSearch] = useState(filters.search ?? '');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<PagoFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PagoFormData, string>>>({});
  const [emitTarget, setEmitTarget] = useState<Pago | null>(null);
  const [viewFacturaId, setViewFacturaId] = useState<number | null>(null);
  const [invoiceSuccessMessage, setInvoiceSuccessMessage] = useState<string | null>(null);
  const [isLoadingFacturaDetail, setIsLoadingFacturaDetail] = useState(false);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const ventasPagables = useMemo(
    () => ventas.filter(isVentaPagable),
    [ventas],
  );

  const selectedVenta = useMemo(
    () => ventas.find((v) => v.id_venta === Number(formData.id_venta)),
    [ventas, formData.id_venta],
  );

  const saldoSeleccionado = selectedVenta ? getSaldoPendiente(selectedVenta) : null;

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchPagos(),
      fetchStats(),
      fetchVentas({ pageSize: 100 }),
    ]);
  }, [fetchPagos, fetchStats, fetchVentas]);

  useEffect(() => {
    loadData();
    return () => {
      clearMessages();
      clearFacturaMessages();
      clearSelectedFactura();
    };
  }, [loadData, clearMessages, clearFacturaMessages, clearSelectedFactura]);

  const handleOpenEmitDialog = (pago: Pago) => {
    clearFacturaMessages();
    setInvoiceSuccessMessage(null);
    setEmitTarget(pago);
  };

  const handleCloseEmitDialog = () => {
    setEmitTarget(null);
  };

  const handleConfirmEmit = async () => {
    if (!emitTarget || isSavingFactura) return;

    const factura: Factura | null = await createFactura({ id_pago: emitTarget.id_pago });
    if (!factura) return;

    patchPagoFactura(emitTarget.id_pago, {
      id_factura: factura.id_factura,
      numero_factura: factura.numero_factura,
    });
    await fetchFacturas({ pageSize: 100 });
    setInvoiceSuccessMessage(
      `Factura ${factura.numero_factura} emitida correctamente por ${formatPrice(factura.total)}`,
    );
    setEmitTarget(null);
  };

  const handleOpenViewFactura = async (pago: Pago) => {
    if (!pago.factura) return;
    clearFacturaMessages();
    setViewFacturaId(pago.factura.id_factura);
    setIsLoadingFacturaDetail(true);
    await fetchFacturaById(pago.factura.id_factura);
    setIsLoadingFacturaDetail(false);
  };

  const handleCloseViewFactura = () => {
    setViewFacturaId(null);
    clearSelectedFactura();
  };

  const handleGoToFacturasModule = () => {
    if (!selectedFactura) return;
    navigate(`/admin/facturas?id_pago=${selectedFactura.id_pago}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchPagos({ search, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters({ page: newPage });
      fetchPagos({ page: newPage });
    }
  };

  const handleOpenCreate = () => {
    clearMessages();
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    clearMessages();
  };

  const handleVentaChange = (ventaId: string) => {
    setFormData((prev) => ({ ...prev, id_venta: ventaId, monto: '', id_financiamiento: '' }));
    setFormErrors({});
  };

  const handleUsarSaldoCompleto = () => {
    if (saldoSeleccionado !== null && saldoSeleccionado > 0) {
      setFormData((prev) => ({ ...prev, monto: saldoSeleccionado.toFixed(2) }));
    }
  };

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof PagoFormData, string>> = {};
    const idVenta = Number(formData.id_venta);
    const monto = Number(formData.monto);

    if (!formData.id_venta || Number.isNaN(idVenta)) {
      errs.id_venta = 'Seleccione una venta válida.';
    } else {
      const venta = ventas.find((v) => v.id_venta === idVenta);
      if (!venta || !isVentaPagable(venta)) {
        errs.id_venta = 'La venta seleccionada no admite pagos (anulada, completada o sin saldo).';
      }
    }

    if (!formData.monto || Number.isNaN(monto) || monto <= 0) {
      errs.monto = 'El monto debe ser mayor a 0.';
    } else if (selectedVenta && monto > getSaldoPendiente(selectedVenta) + 0.001) {
      errs.monto = `El monto no puede superar el saldo pendiente (${formatPrice(getSaldoPendiente(selectedVenta))}).`;
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!validateForm()) return;

    const payload = {
      id_venta: Number(formData.id_venta),
      monto: Number(Number(formData.monto).toFixed(2)),
      metodo_pago: formData.metodo_pago,
      tipo_pago: formData.tipo_pago,
      referencia: formData.referencia.trim() || undefined,
      id_financiamiento: formData.id_financiamiento
        ? Number(formData.id_financiamiento)
        : undefined,
    };

    const ok = await createPago(payload);
    if (ok) {
      handleCloseForm();
      await Promise.all([fetchVentas({ pageSize: 100 }), fetchVentaStats()]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">
            Módulo de Pagos
          </h1>
          <p className="text-muted-foreground text-sm">
            Registra pagos sobre ventas pendientes. Los pagos son inmutables una vez creados.
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

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
      {facturaError && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          {facturaError}
        </div>
      )}
      {successMessage && (
        <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {invoiceSuccessMessage && (
        <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-4 shrink-0" />
          {invoiceSuccessMessage}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Pagos</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{stats.total_pagos}</h3>
              </div>
              <ListChecks className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monto Total</p>
                <h3 className="text-2xl font-black text-primary mt-1">{formatPrice(stats.monto_total)}</h3>
              </div>
              <DollarSign className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completados</p>
                <h3 className="text-2xl font-black text-green-400 mt-1">{stats.por_estado.completado ?? 0}</h3>
              </div>
              <CheckCircle2 className="size-8 text-green-400/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pendientes</p>
                <h3 className="text-2xl font-black text-yellow-400 mt-1">{stats.por_estado.pendiente ?? 0}</h3>
              </div>
              <ReceiptText className="size-8 text-yellow-400/40" />
            </CardContent>
          </Card>
        </div>
      )}

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

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : pagos.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <ReceiptText className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No se encontraron pagos</h3>
          <p className="text-muted-foreground text-sm mt-1">Intente ajustar los filtros o registre un nuevo pago</p>
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Procesado por</TableHead>
                  <TableHead>Factura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.map((pago) => (
                  <TableRow key={pago.id_pago} className="hover:bg-muted/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-muted-foreground">#{pago.id_pago}</TableCell>
                    <TableCell className="font-mono">#{pago.id_venta}</TableCell>
                    <TableCell className="text-right font-black text-primary">{formatPrice(pago.monto)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium text-xs bg-muted/60 px-2.5 py-1 rounded-full border border-border/20">
                        {METODO_ICONS[pago.metodo_pago]}
                        {METODO_LABELS[pago.metodo_pago] ?? pago.metodo_pago}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {TIPO_PAGO_LABELS[pago.tipo_pago] ?? pago.tipo_pago}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={pago.estado} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(pago.fecha_pago)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[140px] truncate">
                      {pago.referencia || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {pago.procesado_por_info?.username ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 min-w-[130px]">
                        {pagoEstaFacturado(pago) ? (
                          <>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-500">
                              <CheckCircle2 className="size-3" />
                              Facturado
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono truncate">
                              {pago.factura?.numero_factura}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenViewFactura(pago)}
                              className="h-7 text-[10px] font-bold uppercase tracking-wider gap-1 px-2"
                            >
                              <Eye className="size-3" />
                              Ver factura
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Sin factura
                            </span>
                            {puedeEmitirFactura(pago) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEmitDialog(pago)}
                                className="h-7 text-[10px] font-bold uppercase tracking-wider gap-1 px-2 border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <Receipt className="size-3" />
                                Emitir factura
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 px-6 py-4 bg-background/40">
              <span className="text-xs text-muted-foreground font-semibold">
                Página <span className="text-foreground">{page}</span> de{' '}
                <span className="text-foreground">{totalPages}</span> — {count} registros
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="rounded-lg text-xs">
                  Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="rounded-lg text-xs">
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseForm} />

          <div className="relative w-full max-w-lg bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <CreditCard className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground tracking-tight">Registrar Nuevo Pago</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    El estado se asignará como completado en el servidor
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleCloseForm} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </Button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Venta pendiente de pago <span className="text-primary">*</span>
                </label>
                <select
                  value={formData.id_venta}
                  onChange={(e) => handleVentaChange(e.target.value)}
                  className={`w-full bg-background border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${
                    formErrors.id_venta ? 'border-destructive' : 'border-border/30 focus:border-primary'
                  }`}
                >
                  <option value="">— Seleccione una venta —</option>
                  {ventasPagables.map((v) => (
                    <option key={v.id_venta} value={v.id_venta}>
                      Venta #{v.id_venta} — {v.username_cliente} — Saldo: {formatPrice(getSaldoPendiente(v))}
                    </option>
                  ))}
                </select>
                {ventasPagables.length === 0 && (
                  <p className="text-xs text-muted-foreground">No hay ventas pendientes con saldo disponible.</p>
                )}
                {formErrors.id_venta && <p className="text-xs text-destructive">{formErrors.id_venta}</p>}
              </div>

              {selectedVenta && saldoSeleccionado !== null && (
                <div className="rounded-lg border border-border/30 bg-muted/30 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total venta</span>
                    <span className="font-mono font-bold">{formatPrice(selectedVenta.total_venta)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pagado</span>
                    <span className="font-mono">{formatPrice(selectedVenta.total_pagado ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Saldo pendiente</span>
                    <span className="font-mono font-black text-primary">{formatPrice(saldoSeleccionado)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Monto <span className="text-primary">*</span>
                  </label>
                  {saldoSeleccionado !== null && saldoSeleccionado > 0 && (
                    <button
                      type="button"
                      onClick={handleUsarSaldoCompleto}
                      className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                    >
                      Usar saldo completo
                    </button>
                  )}
                </div>
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
                      formErrors.monto ? 'border-destructive' : 'border-border/30 focus:border-primary'
                    }`}
                  />
                </div>
                {formErrors.monto && <p className="text-xs text-destructive">{formErrors.monto}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Método</label>
                  <select
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData((p) => ({ ...p, metodo_pago: e.target.value as PagoMetodo }))}
                    className="w-full bg-background border border-border/30 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="credito">Crédito</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo de pago</label>
                  <select
                    value={formData.tipo_pago}
                    onChange={(e) => setFormData((p) => ({ ...p, tipo_pago: e.target.value as PagoTipo }))}
                    className="w-full bg-background border border-border/30 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="contado">Contado</option>
                    <option value="entrada">Entrada</option>
                    <option value="cuota">Cuota</option>
                    <option value="abono">Abono</option>
                  </select>
                </div>
              </div>

              {selectedVenta && (selectedVenta.financiamientos?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Financiamiento (opcional)
                  </label>
                  <select
                    value={formData.id_financiamiento}
                    onChange={(e) => setFormData((p) => ({ ...p, id_financiamiento: e.target.value }))}
                    className="w-full bg-background border border-border/30 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">— Sin financiamiento —</option>
                    {selectedVenta.financiamientos?.map((f) => (
                      <option key={f.id_financiamiento} value={f.id_financiamiento}>
                        {f.entidad_financiera} — {formatPrice(f.monto_financiado)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Referencia <span className="text-neutral-500 font-normal normal-case">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Número de transacción, voucher, etc."
                  value={formData.referencia}
                  onChange={(e) => setFormData((p) => ({ ...p, referencia: e.target.value }))}
                  className="w-full bg-background border border-border/30 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

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
                  disabled={isSaving || ventasPagables.length === 0}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider gap-2"
                >
                  {isSaving ? <span className="animate-pulse">Registrando…</span> : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Registrar Pago
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {emitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseEmitDialog} />
          <div className="relative w-full max-w-md bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Receipt className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground tracking-tight">
                    Emitir factura para este pago
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Django calculará número, subtotal, IVA y total.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleCloseEmitDialog} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </Button>
            </div>

            <div className="p-6 space-y-3">
              <div className="rounded-lg border border-border/30 bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago</span>
                  <span className="font-mono font-bold">#{emitTarget.id_pago}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venta</span>
                  <span className="font-mono font-bold">#{emitTarget.id_venta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto</span>
                  <span className="font-mono font-black text-primary">{formatPrice(emitTarget.monto)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método</span>
                  <span className="font-bold">{METODO_LABELS[emitTarget.metodo_pago] ?? emitTarget.metodo_pago}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEmitDialog}
                  className="flex-1 border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmEmit}
                  disabled={isSavingFactura}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider gap-2"
                >
                  {isSavingFactura ? (
                    <span className="animate-pulse">Emitiendo…</span>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Emitir factura
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewFacturaId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCloseViewFactura} />
          <div className="relative w-full max-w-lg bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <FileText className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground tracking-tight">Detalle de Factura</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Factura vinculada al pago</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleCloseViewFactura} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {isLoadingFacturaDetail || !selectedFactura ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-border/30 bg-muted/30 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">N° Factura</span>
                      <span className="font-bold">{selectedFactura.numero_factura}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pago</span>
                      <span className="font-mono">#{selectedFactura.id_pago}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venta</span>
                      <span className="font-mono">#{selectedFactura.id_venta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Emisión</span>
                      <span>{formatDate(selectedFactura.fecha_emision)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-mono">{formatPrice(selectedFactura.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IVA</span>
                      <span className="font-mono">{formatPrice(selectedFactura.iva)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/20 pt-2">
                      <span className="text-muted-foreground font-bold">Total</span>
                      <span className="font-mono font-black text-primary">{formatPrice(selectedFactura.total)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoToFacturasModule}
                      className="flex-1 border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider"
                    >
                      Ir a Facturas
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCloseViewFactura}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider"
                    >
                      Cerrar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
