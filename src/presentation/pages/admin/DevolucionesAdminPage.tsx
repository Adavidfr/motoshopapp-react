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
import {
  AlertCircle, CheckCircle2, RefreshCcw, DollarSign,
  Search, X, Undo2, XCircle, Eye,
} from 'lucide-react';

export default function DevolucionesAdminPage() {
  const {
    devoluciones, count, filters, stats, isLoading, isSaving, error, successMessage,
    fetchDevoluciones, fetchStats, aprobarDevolucion, rechazarDevolucion,
    setFilters, clearMessages, fetchDevolucionById, selectedDevolucion, clearSelectedDevolucion,
  } = useDevolucionStore();

  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState<number | null>(null);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(() => {
    fetchDevoluciones();
    fetchStats();
  }, [fetchDevoluciones, fetchStats]);

  useEffect(() => {
    load();
    return () => { clearMessages(); };
  }, [load, clearMessages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchDevoluciones({ search, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setFilters({ page: p });
      fetchDevoluciones({ page: p });
    }
  };

  const openDetail = async (id: number) => {
    setDetailId(id);
    clearMessages();
    await fetchDevolucionById(id);
  };

  const closeDetail = () => {
    setDetailId(null);
    clearSelectedDevolucion();
    clearMessages();
  };

  const handleAprobar = async (id: number) => {
    if (isSaving) return;
    if (!confirm('¿Aprobar esta devolución? Se reintegrará inventario y se aplicará reembolso si corresponde.')) return;
    await aprobarDevolucion(id);
    if (detailId === id) await fetchDevolucionById(id);
  };

  const handleRechazar = async (id: number) => {
    if (isSaving) return;
    if (!confirm('¿Rechazar esta solicitud de devolución?')) return;
    await rechazarDevolucion(id);
    if (detailId === id) await fetchDevolucionById(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">Devoluciones</h1>
          <p className="text-muted-foreground text-sm">
            Panel admin: revisar solicitudes del cliente y aprobar o rechazar. La creación la hace el cliente vía POST /devoluciones/.
          </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Registros</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{stats?.total_devoluciones ?? 0}</h3>
            </div>
            <Undo2 className="size-8 text-primary/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pendientes</p>
              <h3 className="text-2xl font-black text-yellow-400 mt-1">{stats?.por_estado.solicitada ?? 0}</h3>
            </div>
            <RefreshCcw className="size-8 text-yellow-400/40" />
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monto Solicitado</p>
              <h3 className="text-2xl font-black text-primary mt-1">{formatPrice(stats?.monto_total ?? 0)}</h3>
            </div>
            <DollarSign className="size-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-muted/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={filters.estado || ''}
          onChange={(e) => {
            const v = e.target.value || undefined;
            setFilters({ estado: v, page: 1 });
            fetchDevoluciones({ estado: v, page: 1 });
          }}
          className="bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Todos los Estados</option>
          <option value="solicitada">Solicitadas</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="completada">Completadas</option>
        </select>
        <Button type="submit" className="bg-muted hover:bg-neutral-700 text-foreground font-bold rounded-lg text-xs uppercase tracking-wider px-6">
          Buscar
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : devoluciones.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <Undo2 className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No hay devoluciones</h3>
          <p className="text-muted-foreground text-sm mt-1">Las solicitudes las crea el cliente desde su cuenta.</p>
        </div>
      ) : (
        <Card className="border-border/30 bg-muted/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Monto sol.</TableHead>
                  <TableHead className="text-right">Reembolso</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead className="w-[130px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devoluciones.map((d) => (
                  <TableRow key={d.id_devolucion} className="hover:bg-muted/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-muted-foreground">#{d.id_devolucion}</TableCell>
                    <TableCell className="font-mono text-foreground">#{d.id_venta}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[180px] truncate" title={d.motivo}>{d.motivo}</TableCell>
                    <TableCell className="text-right font-black text-primary">{formatPrice(d.monto_devolucion)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatPrice(d.monto_reembolso_aplicado)}</TableCell>
                    <TableCell className="text-xs">
                      {d.stock_reintegrado ? (
                        <span className="text-green-400 font-bold">Sí</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell><StatusBadge status={d.estado} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      S: {formatDate(d.fecha_solicitud)}
                      {d.fecha_resolucion && (
                        <>
                          <br />
                          R: {formatDate(d.fecha_resolucion)}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openDetail(d.id_devolucion)}
                          title="Ver detalle"
                          className="text-muted-foreground hover:bg-neutral-500/10"
                        >
                          <Eye className="size-4" />
                        </Button>
                        {d.estado === 'solicitada' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={isSaving}
                              onClick={() => handleAprobar(d.id_devolucion)}
                              title="Aprobar"
                              className="text-green-400 hover:bg-green-500/10"
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={isSaving}
                              onClick={() => handleRechazar(d.id_devolucion)}
                              title="Rechazar"
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              <XCircle className="size-4" />
                            </Button>
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

      {detailId !== null && selectedDevolucion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeDetail} />
          <div className="relative w-full max-w-lg bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-muted/50">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">Devolución #{selectedDevolucion.id_devolucion}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Venta #{selectedDevolucion.id_venta}</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeDetail} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedDevolucion.estado} />
                {selectedDevolucion.stock_reintegrado && (
                  <span className="text-xs text-green-400 font-bold">Stock reintegrado</span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Motivo</p>
                <p className="text-sm text-foreground">{selectedDevolucion.motivo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Monto solicitado</p>
                  <p className="font-mono font-bold">{formatPrice(selectedDevolucion.monto_devolucion)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Reembolso aplicado</p>
                  <p className="font-mono font-bold text-primary">{formatPrice(selectedDevolucion.monto_reembolso_aplicado)}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Solicitud: {formatDate(selectedDevolucion.fecha_solicitud)}</p>
                {selectedDevolucion.fecha_resolucion && (
                  <p>Resolución: {formatDate(selectedDevolucion.fecha_resolucion)}</p>
                )}
              </div>
              {selectedDevolucion.estado === 'solicitada' && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => handleRechazar(selectedDevolucion.id_devolucion)}
                    className="flex-1 text-red-400 border-red-400/30 hover:bg-red-500/10 text-xs font-bold uppercase"
                  >
                    Rechazar
                  </Button>
                  <Button
                    disabled={isSaving}
                    onClick={() => handleAprobar(selectedDevolucion.id_devolucion)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase gap-2"
                  >
                    {isSaving ? 'Procesando…' : 'Aprobar'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
