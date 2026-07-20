// src/presentation/pages/admin/DevolucionesAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDevolucionStore } from '../../store/devolucion.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice, formatDate } from '../../utils/formatters';
import type { Devolucion, DevolucionEstado } from '../../../domain/entities/devolucion.entity';
import {
  AlertCircle, CheckCircle2, RefreshCcw, DollarSign,
  Pencil, Plus, Search, X, Undo2,
} from 'lucide-react';

interface DevForm {
  id_venta: string;
  motivo: string;
  estado: DevolucionEstado;
  monto_devolucion: string;
}

const EMPTY: DevForm = { id_venta: '', motivo: '', estado: 'solicitada', monto_devolucion: '' };

export default function DevolucionesAdminPage() {
  const {
    devoluciones, count, filters, stats, isLoading, isSaving, error, successMessage,
    fetchDevoluciones, fetchStats, createDevolucion, updateDevolucion,
    setFilters, clearMessages, selectedDevolucion, fetchDevolucionById, clearSelectedDevolucion,
  } = useDevolucionStore();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DevForm>(EMPTY);
  const [errs, setErrs] = useState<Partial<DevForm>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(() => { fetchDevoluciones(); fetchStats(); }, [fetchDevoluciones, fetchStats]);

  useEffect(() => { load(); return () => { clearMessages(); }; }, [load, clearMessages]);

  useEffect(() => {
    if (selectedDevolucion) {
      setForm({
        id_venta: String(selectedDevolucion.id_venta),
        motivo: selectedDevolucion.motivo,
        estado: selectedDevolucion.estado,
        monto_devolucion: String(selectedDevolucion.monto_devolucion),
      });
    }
  }, [selectedDevolucion]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchDevoluciones({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) { setFilters({ page: p }); fetchDevoluciones({ page: p }); }
  };


  const handleStatusChangeFast = async (id: number, estado: DevolucionEstado) => {
    if (confirm(`¿Marcar devolución como ${estado}?`)) {
      await updateDevolucion(id, { estado, fecha_resolucion: (estado === 'aprobada' || estado === 'rechazada' || estado === 'completada') ? new Date().toISOString() : null });
      load();
    }
  };

  const openEdit = async (id: number) => {
    setEditingId(id); setErrs({});
    await fetchDevolucionById(id);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingId(null); clearSelectedDevolucion();
    setForm(EMPTY); setErrs({}); setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); clearSelectedDevolucion();
    setForm(EMPTY); setErrs({}); clearMessages();
  };

  const validate = (): boolean => {
    const e: Partial<DevForm> = {};
    if (!form.id_venta || isNaN(Number(form.id_venta))) e.id_venta = 'ID de venta requerido';
    if (!form.motivo.trim()) e.motivo = 'Motivo requerido';
    if (!form.monto_devolucion || Number(form.monto_devolucion) <= 0) e.monto_devolucion = 'Monto inválido';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const isCompleted = form.estado === 'aprobada' || form.estado === 'rechazada' || form.estado === 'completada';
    const payload: Omit<Devolucion, 'id_devolucion' | 'fecha_solicitud' | 'fecha_resolucion'> & { fecha_resolucion?: string | null } = {
      id_venta: Number(form.id_venta),
      motivo: form.motivo.trim(),
      estado: form.estado,
      monto_devolucion: Number(form.monto_devolucion),
      ...(editingId !== null ? { fecha_resolucion: isCompleted ? new Date().toISOString() : null } : {}),
    };
    const ok = editingId !== null ? await updateDevolucion(editingId, payload) : await createDevolucion(payload);
    if (ok) { closeForm(); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Devoluciones</h1>
          <p className="text-muted-foreground text-sm">Gestiona devoluciones de ventas y reembolsos</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-xs gap-2 shrink-0">
          <Plus className="size-4" /> Nueva Devolución
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Registros</p>
              <h3 className="text-2xl font-black text-white mt-1">{stats?.total_devoluciones || 0}</h3>
            </div>
            <Undo2 className="size-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pendientes</p>
              <h3 className="text-2xl font-black text-yellow-400 mt-1">{stats?.por_estado.solicitada || 0}</h3>
            </div>
            <RefreshCcw className="size-8 text-yellow-400/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Monto Total</p>
              <h3 className="text-2xl font-black text-primary mt-1">{formatPrice(stats?.monto_total || 0)}</h3>
            </div>
            <DollarSign className="size-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-neutral-900/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
          <input type="text" placeholder="Buscar por motivo..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select value={filters.estado || ''} onChange={(e) => { const v = e.target.value || undefined; setFilters({ estado: v, page: 1 }); fetchDevoluciones({ estado: v, page: 1 }); }}
          className="bg-neutral-950 border border-border/30 rounded-lg px-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-primary transition-colors">
          <option value="">Todos los Estados</option>
          <option value="solicitada">Solicitadas</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="completada">Completadas</option>
        </select>
        <Button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider px-6">Buscar</Button>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : devoluciones.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 border border-border/30 rounded-2xl">
          <Undo2 className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">No hay devoluciones</h3>
          <Button onClick={openCreate} className="mt-6 bg-primary/90 hover:bg-primary text-white gap-2 text-xs font-bold uppercase"><Plus className="size-4" /> Registrar Devolución</Button>
        </div>
      ) : (
        <Card className="border-border/30 bg-neutral-900/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-950">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Solicitud / Resolución</TableHead>
                  <TableHead className="w-[120px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devoluciones.map((d) => (
                  <TableRow key={d.id_devolucion} className="hover:bg-neutral-900/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-neutral-400">#{d.id_devolucion}</TableCell>
                    <TableCell className="font-mono text-white">#{d.id_venta}</TableCell>
                    <TableCell className="text-neutral-300 text-xs max-w-[200px] truncate" title={d.motivo}>{d.motivo}</TableCell>
                    <TableCell className="text-right font-black text-primary">{formatPrice(d.monto_devolucion)}</TableCell>
                    <TableCell><StatusBadge status={d.estado} /></TableCell>
                    <TableCell>
                      <div className="text-xs text-neutral-400">
                        S: {formatDate(d.fecha_solicitud)}<br/>
                        {d.fecha_resolucion && <span className="text-primary">R: {formatDate(d.fecha_resolucion)}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {d.estado === 'solicitada' && (
                          <>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleStatusChangeFast(d.id_devolucion, 'aprobada')} title="Aprobar" className="text-green-400 hover:bg-green-500/10"><CheckCircle2 className="size-4" /></Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleStatusChangeFast(d.id_devolucion, 'rechazada')} title="Rechazar" className="text-red-400 hover:bg-red-500/10"><X className="size-4" /></Button>
                          </>
                        )}
                        {d.estado === 'aprobada' && (
                          <Button variant="ghost" size="icon-sm" onClick={() => handleStatusChangeFast(d.id_devolucion, 'completada')} title="Completar" className="text-blue-400 hover:bg-blue-500/10"><CheckCircle2 className="size-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(d.id_devolucion)} className="text-neutral-400 hover:bg-neutral-500/10"><Pencil className="size-4" /></Button>
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
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20"><Undo2 className="size-5 text-primary" /></div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">{editingId !== null ? 'Editar Devolución' : 'Registrar Devolución'}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{editingId !== null ? `Registro #${editingId}` : 'Completa los datos de la solicitud'}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeForm} className="text-neutral-400 hover:text-white"><X className="size-5" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">ID Venta <span className="text-primary">*</span></label>
                  <input type="number" placeholder="1" value={form.id_venta} onChange={(e) => setForm((p) => ({ ...p, id_venta: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.id_venta ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.id_venta && <p className="text-xs text-destructive">{errs.id_venta}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Monto a Devolver <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-neutral-400 text-sm font-bold">$</span>
                    <input type="number" step="0.01" min="0.01" placeholder="0.00" value={form.monto_devolucion} onChange={(e) => setForm((p) => ({ ...p, monto_devolucion: e.target.value }))}
                      className={`w-full bg-neutral-950 border rounded-lg pl-6 pr-2 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.monto_devolucion ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                    />
                  </div>
                  {errs.monto_devolucion && <p className="text-xs text-destructive">{errs.monto_devolucion}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Estado</label>
                <select value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value as DevolucionEstado }))}
                  className="w-full bg-neutral-950 border border-border/30 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-primary transition-colors">
                  <option value="solicitada">Solicitada</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                  <option value="completada">Completada</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Motivo <span className="text-primary">*</span></label>
                <textarea rows={3} placeholder="Describe detalladamente el motivo de la devolución..." value={form.motivo} onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))}
                  className={`w-full bg-neutral-950 border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none ${errs.motivo ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                />
                {errs.motivo && <p className="text-xs text-destructive">{errs.motivo}</p>}
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
