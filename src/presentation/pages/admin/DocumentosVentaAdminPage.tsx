// src/presentation/pages/admin/DocumentosVentaAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDocumentoVentaStore } from '../../store/documento-venta.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../utils/formatters';
import type { DocumentoVenta, DocumentoTipo } from '../../../domain/entities/documento-venta.entity';
import {
  AlertCircle, CheckCircle2, FileText, Link2,
  Pencil, Plus, Search, Trash2, X, File,
} from 'lucide-react';

interface DForm {
  id_venta: string;
  tipo_documento: DocumentoTipo;
  archivo_url: string;
}

const EMPTY: DForm = { id_venta: '', tipo_documento: 'contrato', archivo_url: '' };

export default function DocumentosVentaAdminPage() {
  const {
    documentos, count, filters, isLoading, isSaving, error, successMessage,
    fetchDocumentos, createDocumento, updateDocumento, deleteDocumento,
    setFilters, clearMessages, selectedDocumento, fetchDocumentoById, clearSelectedDocumento,
  } = useDocumentoVentaStore();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DForm>(EMPTY);
  const [errs, setErrs] = useState<Partial<DForm>>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(() => { fetchDocumentos(); }, [fetchDocumentos]);

  useEffect(() => { load(); return () => { clearMessages(); }; }, [load, clearMessages]);

  useEffect(() => {
    if (selectedDocumento) {
      setForm({
        id_venta: String(selectedDocumento.id_venta),
        tipo_documento: selectedDocumento.tipo_documento,
        archivo_url: selectedDocumento.archivo_url,
      });
    }
  }, [selectedDocumento]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchDocumentos({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) { setFilters({ page: p }); fetchDocumentos({ page: p }); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este documento?')) { const ok = await deleteDocumento(id); if (ok) load(); }
  };

  const openEdit = async (id: number) => {
    setEditingId(id); setErrs({});
    await fetchDocumentoById(id);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingId(null); clearSelectedDocumento();
    setForm(EMPTY); setErrs({}); setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditingId(null); clearSelectedDocumento();
    setForm(EMPTY); setErrs({}); clearMessages();
  };

  const validate = (): boolean => {
    const e: Partial<DForm> = {};
    if (!form.id_venta || isNaN(Number(form.id_venta))) e.id_venta = 'ID de venta requerido';
    if (!form.archivo_url.trim()) e.archivo_url = 'URL del archivo requerida';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: Omit<DocumentoVenta, 'id_documento' | 'fecha_subida'> = {
      id_venta: Number(form.id_venta),
      tipo_documento: form.tipo_documento,
      archivo_url: form.archivo_url.trim(),
    };
    const ok = editingId !== null ? await updateDocumento(editingId, payload) : await createDocumento(payload);
    if (ok) { closeForm(); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Documentos de Venta</h1>
          <p className="text-muted-foreground text-sm">Gestiona los archivos adjuntos (contratos, soat, etc) de las ventas</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-xs gap-2 shrink-0">
          <Plus className="size-4" /> Nuevo Documento
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
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Archivos</p>
              <h3 className="text-2xl font-black text-white mt-1">{count}</h3>
            </div>
            <FileText className="size-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-neutral-900/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
          <input type="text" placeholder="Buscar por URL del archivo..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select value={filters.tipo_documento || ''} onChange={(e) => { const v = e.target.value || undefined; setFilters({ tipo_documento: v, page: 1 }); fetchDocumentos({ tipo_documento: v, page: 1 }); }}
          className="bg-neutral-950 border border-border/30 rounded-lg px-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-primary transition-colors">
          <option value="">Todos los Tipos</option>
          <option value="contrato">Contrato</option>
          <option value="factura">Factura</option>
          <option value="soat">SOAT</option>
          <option value="garantia">Garantía</option>
          <option value="traspaso">Traspaso</option>
          <option value="otro">Otro</option>
        </select>
        <Button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider px-6">Buscar</Button>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : documentos.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 border border-border/30 rounded-2xl">
          <File className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">No hay documentos</h3>
          <Button onClick={openCreate} className="mt-6 bg-primary/90 hover:bg-primary text-white gap-2 text-xs font-bold uppercase"><Plus className="size-4" /> Subir Documento</Button>
        </div>
      ) : (
        <Card className="border-border/30 bg-neutral-900/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-950">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Archivo / Enlace</TableHead>
                  <TableHead>Fecha Subida</TableHead>
                  <TableHead className="w-[90px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((d) => (
                  <TableRow key={d.id_documento} className="hover:bg-neutral-900/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-neutral-400">#{d.id_documento}</TableCell>
                    <TableCell className="font-mono">#{d.id_venta}</TableCell>
                    <TableCell className="font-bold text-white capitalize">{d.tipo_documento}</TableCell>
                    <TableCell>
                      <a href={d.archivo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1.5 text-xs">
                        <Link2 className="size-3" /> Ver Documento
                      </a>
                    </TableCell>
                    <TableCell className="text-neutral-400 text-xs">{formatDate(d.fecha_subida)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(d.id_documento)} className="text-blue-400 hover:bg-blue-500/10"><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(d.id_documento)} className="text-red-400 hover:bg-red-500/10"><Trash2 className="size-4" /></Button>
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
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20"><FileText className="size-5 text-primary" /></div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">{editingId !== null ? 'Editar Documento' : 'Subir Documento'}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{editingId !== null ? `Documento #${editingId}` : 'Añadir nuevo archivo a la venta'}</p>
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
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Tipo Documento <span className="text-primary">*</span></label>
                  <select value={form.tipo_documento} onChange={(e) => setForm((p) => ({ ...p, tipo_documento: e.target.value as DocumentoTipo }))}
                    className="w-full bg-neutral-950 border border-border/30 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-primary transition-colors">
                    <option value="contrato">Contrato</option>
                    <option value="factura">Factura</option>
                    <option value="soat">SOAT</option>
                    <option value="garantia">Garantía</option>
                    <option value="traspaso">Traspaso</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">URL del Archivo <span className="text-primary">*</span></label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-3 size-4 text-neutral-400" />
                  <input type="text" placeholder="https://..." value={form.archivo_url} onChange={(e) => setForm((p) => ({ ...p, archivo_url: e.target.value }))}
                    className={`w-full bg-neutral-950 border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${errs.archivo_url ? 'border-destructive' : 'border-border/30 focus:border-primary'}`}
                  />
                </div>
                {errs.archivo_url && <p className="text-xs text-destructive">{errs.archivo_url}</p>}
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
