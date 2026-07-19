// src/presentation/pages/admin/NotificacionesAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNotificacionStore } from '../../store/notificacion.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../utils/formatters';
import type { Notificacion } from '../../../domain/entities/notificacion.entity';
import {
  AlertCircle, CheckCircle2, Bell, BellRing, BellOff,
  Pencil, Plus, Search, Trash2, X, Send, Mail
} from 'lucide-react';

interface NForm {
  id_usuario: string;
  titulo: string;
  mensaje: string;
}

interface MForm {
  titulo: string;
  mensaje: string;
}

const EMPTY: NForm = { id_usuario: '', titulo: '', mensaje: '' };
const EMPTY_M: MForm = { titulo: '', mensaje: '' };

export default function NotificacionesAdminPage() {
  const {
    notificaciones, count, filters, isLoading, isSaving, error, successMessage,
    fetchNotificaciones, createNotificacion, updateNotificacion, deleteNotificacion,
    enviarMasivo, marcarLeida, setFilters, clearMessages, selectedNotificacion, fetchNotificacionById, clearSelectedNotificacion,
  } = useNotificacionStore();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showMasivo, setShowMasivo] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState<NForm>(EMPTY);
  const [errs, setErrs] = useState<Partial<NForm>>({});
  
  const [mForm, setMForm] = useState<MForm>(EMPTY_M);
  const [mErrs, setMErrs] = useState<Partial<MForm>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(() => { fetchNotificaciones(); }, [fetchNotificaciones]);

  useEffect(() => { load(); return () => { clearMessages(); }; }, [load, clearMessages]);

  useEffect(() => {
    if (selectedNotificacion) {
      setForm({
        id_usuario: String(selectedNotificacion.id_usuario),
        titulo: selectedNotificacion.titulo,
        mensaje: selectedNotificacion.mensaje,
      });
    }
  }, [selectedNotificacion]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchNotificaciones({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) { setFilters({ page: p }); fetchNotificaciones({ page: p }); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta notificación?')) { const ok = await deleteNotificacion(id); if (ok) load(); }
  };

  const openEdit = async (id: number) => {
    setEditingId(id); setErrs({});
    await fetchNotificacionById(id);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingId(null); clearSelectedNotificacion();
    setForm(EMPTY); setErrs({}); setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); clearSelectedNotificacion();
    setForm(EMPTY); setErrs({}); clearMessages();
  };

  const openMasivo = () => {
    setMForm(EMPTY_M); setMErrs({}); setShowMasivo(true);
  };

  const closeMasivo = () => {
    setShowMasivo(false); setMForm(EMPTY_M); setMErrs({}); clearMessages();
  };

  const validate = (): boolean => {
    const e: Partial<NForm> = {};
    if (!form.id_usuario || isNaN(Number(form.id_usuario))) e.id_usuario = 'ID de usuario requerido';
    if (!form.titulo.trim()) e.titulo = 'Título requerido';
    if (!form.mensaje.trim()) e.mensaje = 'Mensaje requerido';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: Omit<Notificacion, 'id_notificacion' | 'leido' | 'fecha_creacion'> = {
      id_usuario: Number(form.id_usuario),
      titulo: form.titulo.trim(),
      mensaje: form.mensaje.trim(),
    };
    const ok = editingId !== null ? await updateNotificacion(editingId, payload) : await createNotificacion(payload);
    if (ok) { closeForm(); load(); }
  };

  const validateMasivo = (): boolean => {
    const e: Partial<MForm> = {};
    if (!mForm.titulo.trim()) e.titulo = 'Título requerido';
    if (!mForm.mensaje.trim()) e.mensaje = 'Mensaje requerido';
    setMErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleMasivoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMasivo()) return;
    if (!confirm('¿Estás seguro de enviar esta notificación a TODOS los usuarios?')) return;
    
    const ok = await enviarMasivo({
      titulo: mForm.titulo.trim(),
      mensaje: mForm.mensaje.trim(),
    });
    if (ok) { closeMasivo(); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Notificaciones</h1>
          <p className="text-muted-foreground text-sm">Gestiona las notificaciones y correos de los usuarios</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openMasivo} className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold uppercase tracking-wider text-xs gap-2 shrink-0">
            <Mail className="size-4 text-blue-400" /> Enviar Masivo
          </Button>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-xs gap-2 shrink-0">
            <Plus className="size-4" /> Crear Individual
          </Button>
        </div>
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
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Notificaciones</p>
              <h3 className="text-2xl font-black text-white mt-1">{count}</h3>
            </div>
            <BellRing className="size-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-neutral-900/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
          <input type="text" placeholder="Buscar en título o mensaje..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <Button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider px-6">Buscar</Button>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : notificaciones.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 border border-border/30 rounded-2xl">
          <BellOff className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">No hay notificaciones</h3>
          <Button onClick={openCreate} className="mt-6 bg-primary/90 hover:bg-primary text-white gap-2 text-xs font-bold uppercase"><Plus className="size-4" /> Crear Notificación</Button>
        </div>
      ) : (
        <Card className="border-border/30 bg-neutral-900/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-950">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Usuario (ID)</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[120px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificaciones.map((n) => (
                  <TableRow key={n.id_notificacion} className={`border-b border-border/20 transition-colors ${n.leido ? 'bg-neutral-950/30' : 'bg-primary/5 hover:bg-primary/10'}`}>
                    <TableCell className="font-mono font-bold text-neutral-400">#{n.id_notificacion}</TableCell>
                    <TableCell className="font-mono">#{n.id_usuario}</TableCell>
                    <TableCell>
                      <div className="font-bold text-white">{n.titulo}</div>
                      <div className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{n.mensaje}</div>
                    </TableCell>
                    <TableCell>
                      {n.leido 
                        ? <span className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1"><CheckCircle2 className="size-3"/> Leída</span>
                        : <span className="text-xs font-bold text-primary uppercase flex items-center gap-1 animate-pulse"><Bell className="size-3"/> No leída</span>
                      }
                    </TableCell>
                    <TableCell className="text-neutral-400 text-xs">{formatDate(n.fecha_creacion)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {!n.leido && (
                          <Button variant="ghost" size="icon-sm" onClick={() => marcarLeida(n.id_notificacion)} title="Marcar como leída" className="text-primary hover:bg-primary/10">
                            <CheckCircle2 className="size-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(n.id_notificacion)} className="text-neutral-400 hover:bg-neutral-500/10"><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(n.id_notificacion)} className="text-red-400 hover:bg-red-500/10"><Trash2 className="size-4" /></Button>
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

      {/* Modal - Individual */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-lg bg-[#0e0e10] border border-border/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20"><Bell className="size-5 text-primary" /></div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">{editingId !== null ? 'Editar Notificación' : 'Crear Notificación'}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{editingId !== null ? `Registro #${editingId}` : 'Enviar a un usuario específico'}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeForm} className="text-neutral-400 hover:text-white"><X className="size-5" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">ID Usuario <span className="text-primary">*</span></label>
                <input type="number" placeholder="ID del usuario" value={form.id_usuario} onChange={(e) => setForm((p) => ({ ...p, id_usuario: e.target.value }))}
                  className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.id_usuario ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                />
                {errs.id_usuario && <p className="text-xs text-destructive">{errs.id_usuario}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Título <span className="text-primary">*</span></label>
                <input type="text" placeholder="Asunto de la notificación" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.titulo ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                />
                {errs.titulo && <p className="text-xs text-destructive">{errs.titulo}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Mensaje <span className="text-primary">*</span></label>
                <textarea rows={4} placeholder="Escribe el mensaje..." value={form.mensaje} onChange={(e) => setForm((p) => ({ ...p, mensaje: e.target.value }))}
                  className={`w-full bg-neutral-950 border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none ${errs.mensaje ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                />
                {errs.mensaje && <p className="text-xs text-destructive">{errs.mensaje}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1 border-border/40 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider">Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider gap-2">
                  {isSaving ? <span className="animate-pulse">Guardando…</span> : <><CheckCircle2 className="size-4" />{editingId !== null ? 'Actualizar' : 'Enviar y Guardar'}</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Enviar Masivo */}
      {showMasivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeMasivo} />
          <div className="relative w-full max-w-lg bg-[#0e0e10] border border-blue-500/40 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30"><Send className="size-5 text-blue-400" /></div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">Enviar Notificación Masiva</h2>
                  <p className="text-xs text-blue-200/60 mt-0.5">Se enviará un correo a todos los usuarios</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeMasivo} className="text-neutral-400 hover:text-white"><X className="size-5" /></Button>
            </div>

            <form onSubmit={handleMasivoSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider">Título <span className="text-blue-400">*</span></label>
                <input type="text" placeholder="Promoción, aviso importante..." value={mForm.titulo} onChange={(e) => setMForm((p) => ({ ...p, titulo: e.target.value }))}
                  className={`w-full bg-neutral-950 border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors ${mErrs.titulo ? 'border-destructive' : 'border-blue-500/30 focus:border-blue-500'}`}
                />
                {mErrs.titulo && <p className="text-xs text-destructive">{mErrs.titulo}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider">Mensaje (Correo) <span className="text-blue-400">*</span></label>
                <textarea rows={5} placeholder="Escribe el mensaje que se enviará por correo a todos los usuarios..." value={mForm.mensaje} onChange={(e) => setMForm((p) => ({ ...p, mensaje: e.target.value }))}
                  className={`w-full bg-neutral-950 border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none ${mErrs.mensaje ? 'border-destructive' : 'border-blue-500/30 focus:border-blue-500'}`}
                />
                {mErrs.mensaje && <p className="text-xs text-destructive">{mErrs.mensaje}</p>}
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/20 mt-4">
                <Button type="button" variant="outline" onClick={closeMasivo} className="flex-1 border-border/40 text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider">Cancelar</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider gap-2">
                  {isSaving ? <span className="animate-pulse">Enviando…</span> : <><Send className="size-4" /> Enviar a Todos</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
