// src/presentation/pages/admin/HistorialVentasAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useHistorialEstadoVentaStore } from '../../store/historial-estado-venta.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../utils/formatters';
import type { HistorialEstadoVenta } from '../../../domain/entities/historial-estado-venta.entity';
import {
  AlertCircle, ArrowRight, CheckCircle2, History,
  Pencil, Plus, Search, Trash2, X, Activity,
} from 'lucide-react';

interface HForm {
  id_venta: string;
  estado_anterior: string;
  estado_nuevo: string;
  observacion: string;
}

const EMPTY: HForm = { id_venta: '', estado_anterior: '', estado_nuevo: '', observacion: '' };

export default function HistorialVentasAdminPage() {
  const {
    historiales, count, filters, isLoading, isSaving, error, successMessage,
    fetchHistoriales, createHistorial, updateHistorial, deleteHistorial,
    setFilters, clearMessages, selectedHistorial, fetchHistorialById, clearSelectedHistorial,
  } = useHistorialEstadoVentaStore();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HForm>(EMPTY);
  const [errs, setErrs] = useState<Partial<HForm>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(() => { fetchHistoriales(); }, [fetchHistoriales]);

  useEffect(() => { load(); return () => { clearMessages(); }; }, [load, clearMessages]);

  useEffect(() => {
    if (selectedHistorial) {
      setForm({
        id_venta: String(selectedHistorial.id_venta),
        estado_anterior: selectedHistorial.estado_anterior,
        estado_nuevo: selectedHistorial.estado_nuevo,
        observacion: selectedHistorial.observacion,
      });
    }
  }, [selectedHistorial]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchHistoriales({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) { setFilters({ page: p }); fetchHistoriales({ page: p }); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este registro de historial?')) { const ok = await deleteHistorial(id); if (ok) load(); }
  };

  const openEdit = async (id: number) => {
    setEditingId(id); setErrs({});
    await fetchHistorialById(id);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingId(null); clearSelectedHistorial();
    setForm(EMPTY); setErrs({}); setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); clearSelectedHistorial();
    setForm(EMPTY); setErrs({}); clearMessages();
  };

  const validate = (): boolean => {
    const e: Partial<HForm> = {};
    if (!form.id_venta || isNaN(Number(form.id_venta))) e.id_venta = 'ID de venta requerido';
    if (!form.estado_anterior.trim()) e.estado_anterior = 'Estado anterior requerido';
    if (!form.estado_nuevo.trim()) e.estado_nuevo = 'Estado nuevo requerido';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: Omit<HistorialEstadoVenta, 'id_historial' | 'fecha_cambio'> = {
      id_venta: Number(form.id_venta),
      estado_anterior: form.estado_anterior.trim(),
      estado_nuevo: form.estado_nuevo.trim(),
      observacion: form.observacion.trim(),
    };
    const ok = editingId !== null ? await updateHistorial(editingId, payload) : await createHistorial(payload);
    if (ok) { closeForm(); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Historial de Ventas</h1>
          <p className="text-muted-foreground text-sm">Registro de cambios de estado (auditoría) de las ventas</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-xs gap-2 shrink-0">
          <Plus className="size-4" /> Registrar Evento
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Eventos Registrados</p>
              <h3 className="text-2xl font-black text-white mt-1">{count}</h3>
            </div>
            <Activity className="size-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-neutral-900/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
          <input type="text" placeholder="Buscar en observaciones..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
          <input type="number" placeholder="ID Venta" value={filters.id_venta || ''}
            onChange={(e) => { const v = e.target.value ? Number(e.target.value) : undefined; setFilters({ id_venta: v, page: 1 }); fetchHistoriales({ id_venta: v, page: 1 }); }}
            className="w-full bg-neutral-950 border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <Button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider px-6">Buscar</Button>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : historiales.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 border border-border/30 rounded-2xl">
          <History className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">No hay registros</h3>
          <Button onClick={openCreate} className="mt-6 bg-primary/90 hover:bg-primary text-white gap-2 text-xs font-bold uppercase"><Plus className="size-4" /> Registrar Evento</Button>
        </div>
      ) : (
        <Card className="border-border/30 bg-neutral-900/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-950">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Transición de Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Observación</TableHead>
                  <TableHead className="w-[90px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historiales.map((h) => (
                  <TableRow key={h.id_historial} className="hover:bg-neutral-900/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-neutral-400">#{h.id_historial}</TableCell>
                    <TableCell className="font-mono text-white">#{h.id_venta}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-400 uppercase bg-neutral-800 px-2 py-0.5 rounded">{h.estado_anterior}</span>
                        <ArrowRight className="size-3 text-neutral-500" />
                        <span className="text-xs font-bold text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">{h.estado_nuevo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-400 text-xs">{formatDate(h.fecha_cambio)}</TableCell>
                    <TableCell className="text-neutral-300 text-xs max-w-[200px] truncate">{h.observacion || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(h.id_historial)} className="text-blue-400 hover:bg-blue-500/10"><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(h.id_historial)} className="text-red-400 hover:bg-red-500/10"><Trash2 className="size-4" /></Button>
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
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20"><History className="size-5 text-primary" /></div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">{editingId !== null ? 'Editar Evento' : 'Registrar Evento'}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{editingId !== null ? `Registro #${editingId}` : 'Añadir cambio de estado manual'}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeForm} className="text-neutral-400 hover:text-white"><X className="size-5" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">ID Venta <span className="text-primary">*</span></label>
                <input type="number" placeholder="1" value={form.id_venta} onChange={(e) => setForm((p) => ({ ...p, id_venta: e.target.value }))}
                  className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.id_venta ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                />
                {errs.id_venta && <p className="text-xs text-destructive">{errs.id_venta}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Estado Anterior <span className="text-primary">*</span></label>
                  <input type="text" placeholder="Ej: procesando" value={form.estado_anterior} onChange={(e) => setForm((p) => ({ ...p, estado_anterior: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.estado_anterior ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.estado_anterior && <p className="text-xs text-destructive">{errs.estado_anterior}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Estado Nuevo <span className="text-primary">*</span></label>
                  <input type="text" placeholder="Ej: enviada" value={form.estado_nuevo} onChange={(e) => setForm((p) => ({ ...p, estado_nuevo: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.estado_nuevo ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.estado_nuevo && <p className="text-xs text-destructive">{errs.estado_nuevo}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Observación</label>
                <textarea rows={3} placeholder="Detalles del cambio (opcional)..." value={form.observacion} onChange={(e) => setForm((p) => ({ ...p, observacion: e.target.value }))}
                  className="w-full bg-neutral-950 border border-border/30 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1 border-border/40 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider">Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider gap-2">
                  {isSaving ? <span className="animate-pulse">Guardando…</span> : <><CheckCircle2 className="size-4" />{editingId !== null ? 'Actualizar' : 'Guardar'}</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
