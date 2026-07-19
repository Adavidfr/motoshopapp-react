// src/presentation/pages/admin/FacturasAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useFacturaStore } from '../../store/factura.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { formatPrice, formatDate } from '../../utils/formatters';
import type { Factura } from '../../../domain/entities/factura.entity';
import {
  AlertCircle, CheckCircle2, DollarSign, FileText,
  Pencil, Plus, Receipt, Search, Trash2, X,
} from 'lucide-react';

interface FormData {
  id_venta: string;
  numero_factura: string;
  subtotal: string;
  iva: string;
  total: string;
}

const EMPTY: FormData = { id_venta: '', numero_factura: '', subtotal: '', iva: '', total: '' };

export default function FacturasAdminPage() {
  const {
    facturas, count, filters, isLoading, isSaving, error, successMessage,
    fetchFacturas, createFactura, updateFactura, deleteFactura,
    setFilters, clearMessages, selectedFactura, fetchFacturaById, clearSelectedFactura,
  } = useFacturaStore();

  const [search, setSearch] = useState(filters.search ?? '');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errs, setErrs] = useState<Partial<FormData>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(() => { fetchFacturas(); }, [fetchFacturas]);

  useEffect(() => { load(); return () => { clearMessages(); }; }, [load, clearMessages]);

  useEffect(() => {
    if (selectedFactura) {
      setForm({
        id_venta: String(selectedFactura.id_venta),
        numero_factura: selectedFactura.numero_factura,
        subtotal: String(selectedFactura.subtotal),
        iva: String(selectedFactura.iva),
        total: String(selectedFactura.total),
      });
    }
  }, [selectedFactura]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchFacturas({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) { setFilters({ page: p }); fetchFacturas({ page: p }); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta factura?')) { const ok = await deleteFactura(id); if (ok) load(); }
  };

  const openEdit = async (id: number) => {
    setEditingId(id); setErrs({});
    await fetchFacturaById(id);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingId(null); clearSelectedFactura();
    setForm(EMPTY); setErrs({}); setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); clearSelectedFactura();
    setForm(EMPTY); setErrs({}); clearMessages();
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.id_venta || isNaN(Number(form.id_venta))) e.id_venta = 'ID de venta requerido';
    if (!form.numero_factura.trim()) e.numero_factura = 'Número de factura requerido';
    if (!form.subtotal || Number(form.subtotal) < 0) e.subtotal = 'Subtotal inválido';
    if (!form.iva || Number(form.iva) < 0) e.iva = 'IVA inválido';
    if (!form.total || Number(form.total) <= 0) e.total = 'Total inválido';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: Omit<Factura, 'id_factura' | 'fecha_emision'> = {
      id_venta: Number(form.id_venta),
      numero_factura: form.numero_factura.trim(),
      subtotal: Number(form.subtotal),
      iva: Number(form.iva),
      total: Number(form.total),
    };
    const ok = editingId !== null
      ? await updateFactura(editingId, payload)
      : await createFactura(payload);
    if (ok) { closeForm(); load(); }
  };

  // Auto-compute total from subtotal + iva
  const handleSubtotalChange = (val: string) => {
    const sub = parseFloat(val) || 0;
    const iva = parseFloat(form.iva) || 0;
    setForm((p) => ({ ...p, subtotal: val, total: String((sub + iva).toFixed(2)) }));
  };

  const handleIvaChange = (val: string) => {
    const iva = parseFloat(val) || 0;
    const sub = parseFloat(form.subtotal) || 0;
    setForm((p) => ({ ...p, iva: val, total: String((sub + iva).toFixed(2)) }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">
            Módulo de Facturas
          </h1>
          <p className="text-muted-foreground text-sm">
            Emite y administra las facturas asociadas a las ventas
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-xs gap-2 shrink-0">
          <Plus className="size-4" /> Nueva Factura
        </Button>
      </div>

      {/* Messages */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Facturas</p>
              <h3 className="text-2xl font-black text-white mt-1">{count}</h3>
            </div>
            <Receipt className="size-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md col-span-2">
          <CardContent className="p-5 flex items-center gap-3">
            <DollarSign className="size-8 text-primary/40 shrink-0" />
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Facturas Registradas</p>
              <p className="text-sm text-neutral-300 mt-0.5">Cada factura corresponde 1:1 con una venta. Subtotal + IVA = Total.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 bg-neutral-900/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por número de factura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <Button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider px-6">Buscar</Button>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : facturas.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 border border-border/30 rounded-2xl">
          <FileText className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">No se encontraron facturas</h3>
          <p className="text-muted-foreground text-sm mt-1">Registra la primera factura para comenzar</p>
          <Button onClick={openCreate} className="mt-6 bg-primary/90 hover:bg-primary text-white gap-2 text-xs font-bold uppercase">
            <Plus className="size-4" /> Nueva Factura
          </Button>
        </div>
      ) : (
        <Card className="border-border/30 bg-neutral-900/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-950">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>N° Factura</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Emisión</TableHead>
                  <TableHead className="w-[90px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facturas.map((f) => (
                  <TableRow key={f.id_factura} className="hover:bg-neutral-900/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-neutral-400">#{f.id_factura}</TableCell>
                    <TableCell className="font-mono">#{f.id_venta}</TableCell>
                    <TableCell className="font-bold text-white">{f.numero_factura}</TableCell>
                    <TableCell className="text-right text-neutral-300">{formatPrice(f.subtotal)}</TableCell>
                    <TableCell className="text-right text-neutral-400">{formatPrice(f.iva)}</TableCell>
                    <TableCell className="text-right font-black text-primary">{formatPrice(f.total)}</TableCell>
                    <TableCell className="text-neutral-400 text-xs">{formatDate(f.fecha_emision)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(f.id_factura)} className="text-blue-400 hover:bg-blue-500/10"><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(f.id_factura)} className="text-red-400 hover:bg-red-500/10"><Trash2 className="size-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 px-6 py-4 bg-neutral-950/40">
              <span className="text-xs text-neutral-400 font-semibold">Página <span className="text-white">{page}</span> de <span className="text-white">{totalPages}</span></span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePage(page - 1)} disabled={page <= 1} className="rounded-lg text-xs">Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => handlePage(page + 1)} disabled={page >= totalPages} className="rounded-lg text-xs">Siguiente</Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-lg bg-[#0e0e10] border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Receipt className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">
                    {editingId !== null ? 'Editar Factura' : 'Emitir Nueva Factura'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {editingId !== null ? `Factura #${editingId}` : 'Completa los campos requeridos'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeForm} className="text-neutral-400 hover:text-white"><X className="size-5" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2">
                  <AlertCircle className="size-3.5 shrink-0" />{error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">ID Venta <span className="text-primary">*</span></label>
                  <input type="number" placeholder="Ej: 1" value={form.id_venta}
                    onChange={(e) => setForm((p) => ({ ...p, id_venta: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.id_venta ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.id_venta && <p className="text-xs text-destructive">{errs.id_venta}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">N° Factura <span className="text-primary">*</span></label>
                  <input type="text" placeholder="FAC-001" value={form.numero_factura}
                    onChange={(e) => setForm((p) => ({ ...p, numero_factura: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.numero_factura ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.numero_factura && <p className="text-xs text-destructive">{errs.numero_factura}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Subtotal <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-neutral-400 text-sm font-bold">$</span>
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={form.subtotal}
                      onChange={(e) => handleSubtotalChange(e.target.value)}
                      className={`w-full bg-neutral-950 border rounded-lg pl-6 pr-2 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.subtotal ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                    />
                  </div>
                  {errs.subtotal && <p className="text-xs text-destructive">{errs.subtotal}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">IVA <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-neutral-400 text-sm font-bold">$</span>
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={form.iva}
                      onChange={(e) => handleIvaChange(e.target.value)}
                      className={`w-full bg-neutral-950 border rounded-lg pl-6 pr-2 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.iva ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                    />
                  </div>
                  {errs.iva && <p className="text-xs text-destructive">{errs.iva}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Total</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-primary text-sm font-bold">$</span>
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={form.total}
                      onChange={(e) => setForm((p) => ({ ...p, total: e.target.value }))}
                      className="w-full bg-neutral-900 border border-primary/30 rounded-lg pl-6 pr-2 py-2.5 text-sm text-primary font-bold focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  {errs.total && <p className="text-xs text-destructive">{errs.total}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1 border-border/40 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider">Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider gap-2">
                  {isSaving ? <span className="animate-pulse">Guardando…</span> : <><CheckCircle2 className="size-4" />{editingId !== null ? 'Actualizar' : 'Emitir Factura'}</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
