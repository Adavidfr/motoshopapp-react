// src/presentation/pages/admin/FacturasAdminPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useFacturaStore } from '../../store/factura.store';
import { useVentaStore } from '../../store/venta.store';
import type { Venta } from '../../../domain/entities/venta.entity';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import {
  AlertCircle, CheckCircle2, DollarSign, FileText,
  Plus, Receipt, Search, X,
} from 'lucide-react';

interface FormData {
  id_venta: string;
}

const EMPTY: FormData = { id_venta: '' };

function ventaTieneFacturaEnLista(ventaId: number, facturas: { id_venta: number }[]): boolean {
  return facturas.some((f) => f.id_venta === ventaId);
}

function isVentaFacturable(venta: Venta, facturas: { id_venta: number }[]): boolean {
  if (venta.estado === 'anulada') return false;
  if (ventaTieneFacturaEnLista(venta.id_venta, facturas)) return false;
  return true;
}

export default function FacturasAdminPage() {
  const {
    facturas, count, filters, isLoading, isSaving, error, successMessage,
    fetchFacturas, createFactura, setFilters, clearMessages,
    ventaTieneFactura,
  } = useFacturaStore();

  const { ventas, fetchVentas } = useVentaStore();

  const [search, setSearch] = useState(filters.search ?? '');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errs, setErrs] = useState<Partial<FormData>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const ventasFacturables = useMemo(
    () => ventas.filter((v) => isVentaFacturable(v, facturas)),
    [ventas, facturas],
  );

  const selectedVenta = useMemo(
    () => ventas.find((v) => v.id_venta === Number(form.id_venta)),
    [ventas, form.id_venta],
  );

  const load = useCallback(async () => {
    await Promise.all([
      fetchFacturas(),
      fetchVentas({ pageSize: 100 }),
    ]);
  }, [fetchFacturas, fetchVentas]);

  useEffect(() => {
    load();
    return () => { clearMessages(); };
  }, [load, clearMessages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchFacturas({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setFilters({ page: p });
      fetchFacturas({ page: p });
    }
  };

  const openCreate = () => {
    clearMessages();
    setForm(EMPTY);
    setErrs({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY);
    setErrs({});
    clearMessages();
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    const idVenta = Number(form.id_venta);

    if (!form.id_venta || Number.isNaN(idVenta)) {
      e.id_venta = 'Seleccione una venta válida.';
    } else {
      const venta = ventas.find((v) => v.id_venta === idVenta);
      if (!venta || !isVentaFacturable(venta, facturas)) {
        e.id_venta = 'La venta no puede facturarse (anulada o ya facturada).';
      }
      if (ventaTieneFactura(idVenta)) {
        e.id_venta = 'Esta venta ya tiene una factura emitida.';
      }
    }

    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (!validate()) return;

    const ok = await createFactura({
      id_venta: Number(form.id_venta),
    });

    if (ok) closeForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">
            Módulo de Facturas
          </h1>
          <p className="text-muted-foreground text-sm">
            Emisión manual de facturas (1:1 con venta). Los totales los calcula el servidor; no son editables.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs gap-2 shrink-0"
        >
          <Plus className="size-4" /> Emitir Factura
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="size-4 shrink-0" />{error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-4 shrink-0" />{successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Facturas</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{count}</h3>
            </div>
            <Receipt className="size-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md col-span-2">
          <CardContent className="p-5 flex items-center gap-3">
            <DollarSign className="size-8 text-primary/40 shrink-0" />
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reglas de emisión</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Una factura por venta. El número se genera automáticamente (FAC-AÑO-SECUENCIAL). Subtotal, IVA y total los calcula Django.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 bg-muted/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por número de factura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <Button type="submit" className="bg-muted hover:bg-neutral-700 text-foreground font-bold rounded-lg text-xs uppercase tracking-wider px-6">
          Buscar
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : facturas.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <FileText className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No se encontraron facturas</h3>
          <p className="text-muted-foreground text-sm mt-1">Emita la primera factura para comenzar</p>
          <Button onClick={openCreate} className="mt-6 bg-primary/90 hover:bg-primary text-primary-foreground gap-2 text-xs font-bold uppercase">
            <Plus className="size-4" /> Emitir Factura
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
                  <TableHead>N° Factura</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Emisión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facturas.map((f) => (
                  <TableRow key={f.id_factura} className="hover:bg-muted/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-muted-foreground">#{f.id_factura}</TableCell>
                    <TableCell className="font-mono">#{f.id_venta}</TableCell>
                    <TableCell className="font-bold text-foreground">{f.numero_factura}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatPrice(f.subtotal)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatPrice(f.iva)}</TableCell>
                    <TableCell className="text-right font-black text-primary">{formatPrice(f.total)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(f.fecha_emision)}</TableCell>
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
                <Button variant="outline" size="sm" onClick={() => handlePage(page - 1)} disabled={page <= 1} className="rounded-lg text-xs">Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => handlePage(page + 1)} disabled={page >= totalPages} className="rounded-lg text-xs">Siguiente</Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-lg bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Receipt className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground tracking-tight">Emitir Nueva Factura</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Solo `id_venta`. El número y los totales los calcula Django.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Venta a facturar <span className="text-primary">*</span>
                </label>
                <select
                  value={form.id_venta}
                  onChange={(e) => setForm((p) => ({ ...p, id_venta: e.target.value }))}
                  className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${
                    errs.id_venta ? 'border-destructive' : 'border-border/30 focus:border-primary'
                  }`}
                >
                  <option value="">— Seleccione una venta —</option>
                  {ventasFacturables.map((v) => (
                    <option key={v.id_venta} value={v.id_venta}>
                      Venta #{v.id_venta} — {v.username_cliente} — {formatPrice(v.total_venta)}
                    </option>
                  ))}
                </select>
                {ventasFacturables.length === 0 && (
                  <p className="text-xs text-muted-foreground">No hay ventas disponibles para facturar.</p>
                )}
                {errs.id_venta && <p className="text-xs text-destructive">{errs.id_venta}</p>}
              </div>

              {selectedVenta && (
                <div className="rounded-lg border border-border/30 bg-muted/30 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cliente</span>
                    <span className="font-bold">{selectedVenta.username_cliente}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estado venta</span>
                    <StatusBadge status={selectedVenta.estado} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total comercial (base del cálculo)</span>
                    <span className="font-mono font-black text-primary">{formatPrice(selectedVenta.total_venta)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Subtotal, IVA y total de la factura se calcularán al emitir según la tasa configurada en el servidor.
                    El número será asignado automáticamente (ej. FAC-2026-000001).
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  className="flex-1 border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || ventasFacturables.length === 0}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider gap-2"
                >
                  {isSaving ? (
                    <span className="animate-pulse">Emitiendo…</span>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Emitir Factura
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
