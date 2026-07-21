// src/presentation/pages/admin/SegurosAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSeguroStore } from '../../store/seguro.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice } from '../../utils/formatters';
import type { Seguro, SeguroEstado } from '../../../domain/entities/seguro.entity';
import {
  AlertCircle, ArrowLeftRight, CheckCircle2, DollarSign,
  Pencil, Plus, Search, Shield, ShieldAlert, Trash2, X,
} from 'lucide-react';

interface SForm {
  id_venta: string;
  aseguradora: string;
  numero_poliza: string;
  tipo_cobertura: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo_anual: string;
  estado: SeguroEstado;
}

const EMPTY: SForm = {
  id_venta: '', aseguradora: '', numero_poliza: '', tipo_cobertura: '',
  fecha_inicio: '', fecha_fin: '', costo_anual: '', estado: 'activo',
};

const ESTADO_CYCLE: SeguroEstado[] = ['activo', 'vencido', 'cancelado'];

export default function SegurosAdminPage() {
  const {
    seguros, count, filters, isLoading, isSaving, error, successMessage,
    fetchSeguros, createSeguro, updateSeguro, updateSeguroStatus, deleteSeguro,
    setFilters, clearMessages, selectedSeguro, fetchSeguroById, clearSelectedSeguro,
  } = useSeguroStore();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SForm>(EMPTY);
  const [errs, setErrs] = useState<Partial<SForm>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(() => { fetchSeguros(); }, [fetchSeguros]);

  useEffect(() => { load(); return () => { clearMessages(); }; }, [load, clearMessages]);

  useEffect(() => {
    if (selectedSeguro) {
      setForm({
        id_venta: String(selectedSeguro.id_venta),
        aseguradora: selectedSeguro.aseguradora,
        numero_poliza: selectedSeguro.numero_poliza,
        tipo_cobertura: selectedSeguro.tipo_cobertura,
        fecha_inicio: selectedSeguro.fecha_inicio,
        fecha_fin: selectedSeguro.fecha_fin,
        costo_anual: String(selectedSeguro.costo_anual),
        estado: selectedSeguro.estado,
      });
    }
  }, [selectedSeguro]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchSeguros({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) { setFilters({ page: p }); fetchSeguros({ page: p }); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este seguro?')) { const ok = await deleteSeguro(id); if (ok) load(); }
  };

  const handleStatusCycle = async (id: number, current: string) => {
    const idx = ESTADO_CYCLE.indexOf(current as SeguroEstado);
    const next = ESTADO_CYCLE[(idx + 1) % ESTADO_CYCLE.length];
    if (confirm(`¿Cambiar estado a "${next}"?`)) await updateSeguroStatus(id, next);
  };

  const openEdit = async (id: number) => {
    setEditingId(id); setErrs({});
    await fetchSeguroById(id);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingId(null); clearSelectedSeguro();
    setForm(EMPTY); setErrs({}); setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); clearSelectedSeguro();
    setForm(EMPTY); setErrs({}); clearMessages();
  };

  const validate = (): boolean => {
    const e: Partial<SForm> = {};
    if (!form.id_venta || isNaN(Number(form.id_venta))) e.id_venta = 'ID de venta requerido';
    if (!form.aseguradora.trim()) e.aseguradora = 'Aseguradora requerida';
    if (!form.numero_poliza.trim()) e.numero_poliza = 'N° de póliza requerido';
    if (!form.tipo_cobertura.trim()) e.tipo_cobertura = 'Tipo de cobertura requerido';
    if (!form.fecha_inicio) e.fecha_inicio = 'Fecha de inicio requerida';
    if (!form.fecha_fin) e.fecha_fin = 'Fecha de fin requerida';
    if (!form.costo_anual || Number(form.costo_anual) <= 0) e.costo_anual = 'Costo anual inválido';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: Omit<Seguro, 'id_seguro'> = {
      id_venta: Number(form.id_venta),
      aseguradora: form.aseguradora.trim(),
      numero_poliza: form.numero_poliza.trim(),
      tipo_cobertura: form.tipo_cobertura.trim(),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin,
      costo_anual: Number(form.costo_anual),
      estado: form.estado,
    };
    const ok = editingId !== null ? await updateSeguro(editingId, payload) : await createSeguro(payload);
    if (ok) { closeForm(); load(); }
  };

  const totalActivos = seguros.filter((s) => s.estado === 'activo').length;
  const costoTotal = seguros.reduce((acc, s) => acc + s.costo_anual, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">Módulo de Seguros</h1>
          <p className="text-muted-foreground text-sm">Administra las pólizas de seguro vinculadas a ventas de motos</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs gap-2 shrink-0">
          <Plus className="size-4" /> Nuevo Seguro
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
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Seguros</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{count}</h3>
            </div>
            <Shield className="size-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pólizas Activas</p>
              <h3 className="text-2xl font-black text-green-400 mt-1">{totalActivos}</h3>
            </div>
            <CheckCircle2 className="size-8 text-green-400/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Costo Anual Total</p>
              <h3 className="text-2xl font-black text-primary mt-1">{formatPrice(costoTotal)}</h3>
            </div>
            <DollarSign className="size-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-muted/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por aseguradora, póliza, cobertura..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select value={filters.estado || ''} onChange={(e) => { const v = e.target.value || undefined; setFilters({ estado: v, page: 1 }); fetchSeguros({ estado: v, page: 1 }); }}
          className="bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors">
          <option value="">Todos los Estados</option>
          <option value="activo">Activo</option>
          <option value="vencido">Vencido</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <Button type="submit" className="bg-muted hover:bg-neutral-700 text-foreground font-bold rounded-lg text-xs uppercase tracking-wider px-6">Buscar</Button>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : seguros.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <ShieldAlert className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No se encontraron seguros</h3>
          <Button onClick={openCreate} className="mt-6 bg-primary/90 hover:bg-primary text-primary-foreground gap-2 text-xs font-bold uppercase"><Plus className="size-4" /> Nuevo Seguro</Button>
        </div>
      ) : (
        <Card className="border-border/30 bg-muted/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Aseguradora</TableHead>
                  <TableHead>N° Póliza</TableHead>
                  <TableHead>Cobertura</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead className="text-right">Costo Anual</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seguros.map((s) => (
                  <TableRow key={s.id_seguro} className="hover:bg-muted/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-muted-foreground">#{s.id_seguro}</TableCell>
                    <TableCell className="font-mono">#{s.id_venta}</TableCell>
                    <TableCell className="font-bold text-foreground">{s.aseguradora}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{s.numero_poliza}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.tipo_cobertura}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.fecha_inicio}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.fecha_fin}</TableCell>
                    <TableCell className="text-right font-black text-primary">{formatPrice(s.costo_anual)}</TableCell>
                    <TableCell><StatusBadge status={s.estado} /></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleStatusCycle(s.id_seguro, s.estado)} title="Cambiar Estado" className="text-primary hover:bg-primary/10"><ArrowLeftRight className="size-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s.id_seguro)} className="text-blue-400 hover:bg-blue-500/10"><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(s.id_seguro)} className="text-red-400 hover:bg-red-500/10"><Trash2 className="size-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 px-6 py-4 bg-background/40">
              <span className="text-xs text-muted-foreground font-semibold">Página <span className="text-foreground">{page}</span> de <span className="text-foreground">{totalPages}</span></span>
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
          <div className="relative w-full max-w-2xl bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20"><Shield className="size-5 text-primary" /></div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground tracking-tight">{editingId !== null ? 'Editar Seguro' : 'Registrar Seguro'}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{editingId !== null ? `Seguro #${editingId}` : 'Completa los datos de la póliza'}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeForm} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2">
                  <AlertCircle className="size-3.5 shrink-0" />{error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ID Venta <span className="text-primary">*</span></label>
                  <input type="number" placeholder="1" value={form.id_venta} onChange={(e) => setForm((p) => ({ ...p, id_venta: e.target.value }))}
                    className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${errs.id_venta ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.id_venta && <p className="text-xs text-destructive">{errs.id_venta}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aseguradora <span className="text-primary">*</span></label>
                  <input type="text" placeholder="Nombre de la aseguradora" value={form.aseguradora} onChange={(e) => setForm((p) => ({ ...p, aseguradora: e.target.value }))}
                    className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${errs.aseguradora ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.aseguradora && <p className="text-xs text-destructive">{errs.aseguradora}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">N° Póliza <span className="text-primary">*</span></label>
                  <input type="text" placeholder="POL-2026-001" value={form.numero_poliza} onChange={(e) => setForm((p) => ({ ...p, numero_poliza: e.target.value }))}
                    className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${errs.numero_poliza ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.numero_poliza && <p className="text-xs text-destructive">{errs.numero_poliza}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo de Cobertura <span className="text-primary">*</span></label>
                  <input type="text" placeholder="Todo Riesgo / Básica / Terceros" value={form.tipo_cobertura} onChange={(e) => setForm((p) => ({ ...p, tipo_cobertura: e.target.value }))}
                    className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${errs.tipo_cobertura ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.tipo_cobertura && <p className="text-xs text-destructive">{errs.tipo_cobertura}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha Inicio <span className="text-primary">*</span></label>
                  <input type="date" value={form.fecha_inicio} onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))}
                    className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${errs.fecha_inicio ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.fecha_inicio && <p className="text-xs text-destructive">{errs.fecha_inicio}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fecha Fin <span className="text-primary">*</span></label>
                  <input type="date" value={form.fecha_fin} onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))}
                    className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${errs.fecha_fin ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                  {errs.fecha_fin && <p className="text-xs text-destructive">{errs.fecha_fin}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Costo Anual <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-muted-foreground text-sm font-bold">$</span>
                    <input type="number" step="0.01" min="0.01" placeholder="0.00" value={form.costo_anual} onChange={(e) => setForm((p) => ({ ...p, costo_anual: e.target.value }))}
                      className={`w-full bg-background border rounded-lg pl-6 pr-2 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${errs.costo_anual ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                    />
                  </div>
                  {errs.costo_anual && <p className="text-xs text-destructive">{errs.costo_anual}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</label>
                <select value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value as SeguroEstado }))}
                  className="w-full bg-background border border-border/30 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-primary transition-colors">
                  <option value="activo">Activo</option>
                  <option value="vencido">Vencido</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1 border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider">Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider gap-2">
                  {isSaving ? <span className="animate-pulse">Guardando…</span> : <><CheckCircle2 className="size-4" />{editingId !== null ? 'Actualizar' : 'Registrar Seguro'}</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
