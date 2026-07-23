// src/presentation/pages/admin/DocumentosVentaAdminPage.tsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDocumentoVentaStore } from '../../store/documento-venta.store';
import { useVentaStore } from '../../store/venta.store';
import type { DocumentoVentaTipo } from '../../../domain/entities/documento-venta.entity';
import {
  DOCUMENTO_VENTA_ACCEPT,
  DOCUMENTO_VENTA_EXTENSIONES,
  DOCUMENTO_VENTA_MAX_BYTES,
} from '../../../domain/entities/documento-venta.entity';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../utils/formatters';
import {
  AlertCircle, CheckCircle2, Download, FileText, File,
  Plus, Search, Trash2, X, Upload,
} from 'lucide-react';

interface DForm {
  id_venta: string;
  tipo_documento: DocumentoVentaTipo;
}

const EMPTY: DForm = { id_venta: '', tipo_documento: 'contrato' };

const TIPO_LABELS: Record<DocumentoVentaTipo, string> = {
  contrato: 'Contrato',
  factura: 'Factura',
  soat: 'SOAT',
  garantia: 'Garantía',
  traspaso: 'Traspaso',
  otro: 'Otro',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasAllowedExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return DOCUMENTO_VENTA_EXTENSIONES.some((ext) => lower.endsWith(ext));
}

export default function DocumentosVentaAdminPage() {
  const {
    documentos, count, filters, isLoading, isSaving, isDownloading, error, successMessage,
    fetchDocumentos, createDocumento, deleteDocumento, downloadDocumento,
    setFilters, clearMessages,
  } = useDocumentoVentaStore();

  const { ventas, fetchVentas } = useVentaStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DForm>(EMPTY);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errs, setErrs] = useState<{ id_venta?: string; archivo?: string }>({});

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const ventasDisponibles = useMemo(
    () => ventas.filter((v) => v.estado !== 'anulada'),
    [ventas],
  );

  const load = useCallback(async () => {
    await Promise.all([
      fetchDocumentos(),
      fetchVentas({ pageSize: 100 }),
    ]);
  }, [fetchDocumentos, fetchVentas]);

  useEffect(() => {
    load();
    return () => { clearMessages(); };
  }, [load, clearMessages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchDocumentos({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setFilters({ page: p });
      fetchDocumentos({ page: p });
    }
  };

  const openCreate = () => {
    clearMessages();
    setForm(EMPTY);
    setSelectedFile(null);
    setErrs({});
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY);
    setSelectedFile(null);
    setErrs({});
    if (fileInputRef.current) fileInputRef.current.value = '';
    clearMessages();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setErrs((prev) => ({ ...prev, archivo: undefined }));
  };

  const validate = (): boolean => {
    const e: { id_venta?: string; archivo?: string } = {};

    if (!form.id_venta || Number.isNaN(Number(form.id_venta))) {
      e.id_venta = 'Seleccione una venta válida.';
    }

    if (!selectedFile) {
      e.archivo = 'Debe seleccionar un archivo.';
    } else {
      if (!hasAllowedExtension(selectedFile.name)) {
        e.archivo = `Extensión no permitida. Use: ${DOCUMENTO_VENTA_EXTENSIONES.join(', ')}`;
      }
      if (selectedFile.size > DOCUMENTO_VENTA_MAX_BYTES) {
        e.archivo = `El archivo excede ${DOCUMENTO_VENTA_MAX_BYTES / (1024 * 1024)} MB.`;
      }
      if (selectedFile.size <= 0) {
        e.archivo = 'El archivo está vacío.';
      }
    }

    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !selectedFile) return;
    if (!validate()) return;

    const ok = await createDocumento({
      id_venta: Number(form.id_venta),
      tipo_documento: form.tipo_documento,
      archivo: selectedFile,
    });

    if (ok) closeForm();
  };

  const handleDelete = async (id: number) => {
    if (isSaving) return;
    if (confirm('¿Eliminar este documento y su archivo físico?')) {
      await deleteDocumento(id);
    }
  };

  const handleDownload = async (id: number, nombre: string) => {
    await downloadDocumento(id, nombre);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">Documentos de Venta</h1>
          <p className="text-muted-foreground text-sm">
            Subida multipart de archivos reales (PDF/imagen). Sin URLs manuales ni edición posterior.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs gap-2 shrink-0">
          <Plus className="size-4" /> Subir Documento
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Archivos</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{count}</h3>
            </div>
            <FileText className="size-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Formatos permitidos</p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, JPG, PNG — máx. 10 MB. Descarga autenticada vía endpoint /archivo/ del documento.
            </p>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-muted/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por tipo o nombre original..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={filters.tipo_documento || ''}
          onChange={(e) => {
            const v = e.target.value || undefined;
            setFilters({ tipo_documento: v, page: 1 });
            fetchDocumentos({ tipo_documento: v, page: 1 });
          }}
          className="bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Todos los Tipos</option>
          {(Object.keys(TIPO_LABELS) as DocumentoVentaTipo[]).map((tipo) => (
            <option key={tipo} value={tipo}>{TIPO_LABELS[tipo]}</option>
          ))}
        </select>
        <Button type="submit" className="bg-muted hover:bg-neutral-700 text-foreground font-bold rounded-lg text-xs uppercase tracking-wider px-6">
          Buscar
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : documentos.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <File className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No hay documentos</h3>
          <Button onClick={openCreate} className="mt-6 bg-primary/90 hover:bg-primary text-primary-foreground gap-2 text-xs font-bold uppercase">
            <Plus className="size-4" /> Subir Documento
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Subido por</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-[100px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((d) => (
                  <TableRow key={d.id_documento} className="hover:bg-muted/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-muted-foreground">#{d.id_documento}</TableCell>
                    <TableCell className="font-mono">#{d.id_venta}</TableCell>
                    <TableCell className="font-bold text-foreground capitalize">{TIPO_LABELS[d.tipo_documento]}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate" title={d.nombre_original}>
                      {d.nombre_original || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatBytes(d.tamano_bytes)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.subido_por_info?.username ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(d.fecha_subida)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isDownloading}
                          onClick={() => handleDownload(d.id_documento, d.nombre_original)}
                          title="Descargar (autenticado)"
                          className="text-primary hover:bg-primary/10"
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isSaving}
                          onClick={() => handleDelete(d.id_documento)}
                          title="Eliminar"
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
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20"><Upload className="size-5 text-primary" /></div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground tracking-tight">Subir Documento</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">multipart/form-data — campo `archivo`</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeForm} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Venta <span className="text-primary">*</span></label>
                <select
                  value={form.id_venta}
                  onChange={(e) => setForm((p) => ({ ...p, id_venta: e.target.value }))}
                  className={`w-full bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none transition-colors ${
                    errs.id_venta ? 'border-destructive' : 'border-border/30 focus:border-primary'
                  }`}
                >
                  <option value="">— Seleccione una venta —</option>
                  {ventasDisponibles.map((v) => (
                    <option key={v.id_venta} value={v.id_venta}>
                      Venta #{v.id_venta} — {v.username_cliente}
                    </option>
                  ))}
                </select>
                {errs.id_venta && <p className="text-xs text-destructive">{errs.id_venta}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo documento <span className="text-primary">*</span></label>
                <select
                  value={form.tipo_documento}
                  onChange={(e) => setForm((p) => ({ ...p, tipo_documento: e.target.value as DocumentoVentaTipo }))}
                  className="w-full bg-background border border-border/30 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  {(Object.keys(TIPO_LABELS) as DocumentoVentaTipo[]).map((tipo) => (
                    <option key={tipo} value={tipo}>{TIPO_LABELS[tipo]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Archivo <span className="text-primary">*</span></label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={DOCUMENTO_VENTA_ACCEPT}
                  onChange={handleFileChange}
                  className={`w-full bg-background border rounded-lg px-3 py-2 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-primary ${
                    errs.archivo ? 'border-destructive' : 'border-border/30'
                  }`}
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    {selectedFile.name} — {formatBytes(selectedFile.size)}
                  </p>
                )}
                {errs.archivo && <p className="text-xs text-destructive">{errs.archivo}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1 border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving || ventasDisponibles.length === 0} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider gap-2">
                  {isSaving ? <span className="animate-pulse">Subiendo…</span> : <><CheckCircle2 className="size-4" />Subir</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
