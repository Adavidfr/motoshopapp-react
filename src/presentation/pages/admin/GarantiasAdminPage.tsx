// src/presentation/pages/admin/GarantiasAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useGarantiaStore } from '../../store/garantia.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import type { Garantia, GarantiaEstado } from '../../../domain/entities/garantia.entity';
import {
  AlertCircle, ArrowLeftRight, Calendar, CheckCircle2,
  Pencil, Plus, Search, ShieldCheck, Trash2, X,
} from 'lucide-react';

interface GForm {
  id_venta: string;
  id_moto: string;
  meses_garantia: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  estado: GarantiaEstado;
}

const EMPTY: GForm = {
  id_venta: '', id_moto: '', meses_garantia: '', fecha_inicio: '', fecha_fin: '', descripcion: '', estado: 'activa',
};

const ESTADO_CYCLE: GarantiaEstado[] = ['activa', 'vencida', 'anulada'];

export default function GarantiasAdminPage() {
  const {
    garantias, count, filters, isLoading, isSaving, error, successMessage,
    fetchGarantias, createGarantia, updateGarantia, updateGarantiaStatus, deleteGarantia,
    setFilters, clearMessages, selectedGarantia, fetchGarantiaById, clearSelectedGarantia,
  } = useGarantiaStore();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GForm>(EMPTY);
  const [errs, setErrs] = useState<Partial<GForm>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(() => { fetchGarantias(); }, [fetchGarantias]);

  useEffect(() => { load(); return () => { clearMessages(); }; }, [load, clearMessages]);

  useEffect(() => {
    if (selectedGarantia) {
      setForm({
        id_venta: String(selectedGarantia.id_venta),
        id_moto: String(selectedGarantia.id_moto),
        meses_garantia: String(selectedGarantia.meses_garantia),
        fecha_inicio: selectedGarantia.fecha_inicio,
        fecha_fin: selectedGarantia.fecha_fin,
        descripcion: selectedGarantia.descripcion,
        estado: selectedGarantia.estado,
      });
    }
  }, [selectedGarantia]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchGarantias({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) { setFilters({ page: p }); fetchGarantias({ page: p }); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta garantía?')) { const ok = await deleteGarantia(id); if (ok) load(); }
  };

  const handleStatusCycle = async (id: number, current: string) => {
    const idx = ESTADO_CYCLE.indexOf(current as GarantiaEstado);
    const next = ESTADO_CYCLE[(idx + 1) % ESTADO_CYCLE.length];
    if (confirm(`¿Cambiar estado a "${next}"?`)) await updateGarantiaStatus(id, next);
  };

  const openEdit = async (id: number) => {
    setEditingId(id); setErrs({});
    await fetchGarantiaById(id);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingId(null); clearSelectedGarantia();
    setForm(EMPTY); setErrs({}); setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); clearSelectedGarantia();
    setForm(EMPTY); setErrs({}); clearMessages();
  };

  const validate = (): boolean => {
    const e: Partial<GForm> = {};
    if (!form.id_venta || isNaN(Number(form.id_venta))) e.id_venta = 'ID de venta requerido';
    if (!form.id_moto || isNaN(Number(form.id_moto))) e.id_moto = 'ID de moto requerido';
    if (!form.meses_garantia || Number(form.meses_garantia) <= 0) e.meses_garantia = 'Meses requeridos';
    if (!form.fecha_inicio) e.fecha_inicio = 'Fecha de inicio requerida';
    if (!form.fecha_fin) e.fecha_fin = 'Fecha de fin requerida';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: Omit<Garantia, 'id_garantia'> = {
      id_venta: Number(form.id_venta),
      id_moto: Number(form.id_moto),
      meses_garantia: Number(form.meses_garantia),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      descripcion: form.descripcion,
      estado: form.estado,
    };
    const ok = editingId !== null ? await updateGarantia(editingId, payload) : await createGarantia(payload);
    if (ok) { closeForm(); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Módulo de Garantías</h1>
          <p className="text-muted-foreground text-sm">Gestiona las garantías de las motos vendidas</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-xs gap-2 shrink-0">
          <Plus className="size-4" /> Nueva Garantía
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
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Garantías</p>
              <h3 className="text-2xl font-black text-white mt-1">{count}</h3>
            </div>
            <ShieldCheck className="size-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Activas</p>
              <h3 className="text-2xl font-black text-green-400 mt-1">
                {garantias.filter((g) => g.estado === 'activa').length}
              </h3>
            </div>
            <CheckCircle2 className="size-8 text-green-400/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Vencidas / Anuladas</p>
              <h3 className="text-2xl font-black text-red-400 mt-1">
                {garantias.filter((g) => g.estado !== 'activa').length}
              </h3>
            </div>
            <Calendar className="size-8 text-red-400/40" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-neutral-900/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
          <input type="text" placeholder="Buscar por descripción..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select value={filters.estado || ''} onChange={(e) => { const v = e.target.value || undefined; setFilters({ estado: v, page: 1 }); fetchGarantias({ estado: v, page: 1 }); }}
          className="bg-neutral-950 border border-border/30 rounded-lg px-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-primary transition-colors">
          <option value="">Todos los Estados</option>
          <option value="activa">Activa</option>
          <option value="vencida">Vencida</option>
          <option value="anulada">Anulada</option>
        </select>
        <Button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider px-6">Buscar</Button>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : garantias.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 border border-border/30 rounded-2xl">
          <ShieldCheck className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">No se encontraron garantías</h3>
          <Button onClick={openCreate} className="mt-6 bg-primary/90 hover:bg-primary text-white gap-2 text-xs font-bold uppercase"><Plus className="size-4" /> Nueva Garantía</Button>
        </div>
      ) : (
        <Card className="border-border/30 bg-neutral-900/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-950">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Moto</TableHead>
                  <TableHead className="text-center">Meses</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[100px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {garantias.map((g) => (
                  <TableRow key={g.id_garantia} className="hover:bg-neutral-900/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-neutral-400">#{g.id_garantia}</TableCell>
                    <TableCell className="font-mono">#{g.id_venta}</TableCell>
                    <TableCell className="font-mono">#{g.id_moto}</TableCell>
                    <TableCell className="text-center font-bold text-white">{g.meses_garantia}m</TableCell>
                    <TableCell className="text-neutral-400 text-xs">{g.fecha_inicio}</TableCell>
                    <TableCell className="text-neutral-400 text-xs">{g.fecha_fin}</TableCell>
                    <TableCell><StatusBadge status={g.estado} /></TableCell>
                    <TableCell className="text-neutral-400 text-xs max-w-[160px] truncate">{g.descripcion || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleStatusCycle(g.id_garantia, g.estado)} title="Cambiar Estado" className="text-primary hover:bg-primary/10"><ArrowLeftRight className="size-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(g.id_garantia)} className="text-blue-400 hover:bg-blue-500/10"><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(g.id_garantia)} className="text-red-400 hover:bg-red-500/10"><Trash2 className="size-4" /></Button>
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
          <div className="relative w-full max-w-xl bg-[#0e0e10] border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20"><ShieldCheck className="size-5 text-primary" /></div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">{editingId !== null ? 'Editar Garantía' : 'Registrar Garantía'}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{editingId !== null ? `Garantía #${editingId}` : 'Completa los datos de la garantía'}</p>
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">ID Venta <span className="text-primary">*</span></label>
                  <input type="number" placeholder="1" value={form.id_venta} onChange={(e) => setForm((p) => ({ ...p, id_venta: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.id_venta ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.id_venta && <p className="text-xs text-destructive">{errs.id_venta}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">ID Moto <span className="text-primary">*</span></label>
                  <input type="number" placeholder="1" value={form.id_moto} onChange={(e) => setForm((p) => ({ ...p, id_moto: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.id_moto ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.id_moto && <p className="text-xs text-destructive">{errs.id_moto}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Meses <span className="text-primary">*</span></label>
                  <input type="number" placeholder="12" value={form.meses_garantia} onChange={(e) => setForm((p) => ({ ...p, meses_garantia: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.meses_garantia ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.meses_garantia && <p className="text-xs text-destructive">{errs.meses_garantia}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Fecha Inicio <span className="text-primary">*</span></label>
                  <input type="date" value={form.fecha_inicio} onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.fecha_inicio ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.fecha_inicio && <p className="text-xs text-destructive">{errs.fecha_inicio}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Fecha Fin <span className="text-primary">*</span></label>
                  <input type="date" value={form.fecha_fin} onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.fecha_fin ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.fecha_fin && <p className="text-xs text-destructive">{errs.fecha_fin}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Estado</label>
                <select value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value as GarantiaEstado }))}
                  className="w-full bg-neutral-950 border border-border/30 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-primary transition-colors">
                  <option value="activa">Activa</option>
                  <option value="vencida">Vencida</option>
                  <option value="anulada">Anulada</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Descripción <span className="text-neutral-500 font-normal normal-case">(opcional)</span></label>
                <textarea rows={3} placeholder="Cobertura, términos de la garantía..." value={form.descripcion}
                  onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                  className="w-full bg-neutral-950 border border-border/30 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1 border-border/40 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider">Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider gap-2">
                  {isSaving ? <span className="animate-pulse">Guardando…</span> : <><CheckCircle2 className="size-4" />{editingId !== null ? 'Actualizar' : 'Registrar Garantía'}</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
