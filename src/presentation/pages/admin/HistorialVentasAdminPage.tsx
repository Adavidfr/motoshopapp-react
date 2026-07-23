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
import {
  AlertCircle, ArrowRight, History, Search, Activity, Info,
} from 'lucide-react';

const ESTADO_NUEVO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'completada', label: 'Completada' },
  { value: 'anulada', label: 'Anulada' },
] as const;

function formatEstadoLabel(estado: string): string {
  if (!estado.trim()) return '(inicial)';
  const found = ESTADO_NUEVO_OPTIONS.find((o) => o.value === estado);
  return found?.label ?? estado;
}

export default function HistorialVentasAdminPage() {
  const {
    historiales,
    count,
    filters,
    isLoading,
    error,
    fetchHistoriales,
    setFilters,
    clearMessages,
  } = useHistorialEstadoVentaStore();

  const [search, setSearch] = useState(filters.search ?? '');

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const load = useCallback(() => {
    fetchHistoriales();
  }, [fetchHistoriales]);

  useEffect(() => {
    load();
    return () => {
      clearMessages();
    };
  }, [load, clearMessages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, page: 1 });
    fetchHistoriales({ search, page: 1 });
  };

  const handleEstadoNuevoChange = (value: string) => {
    const estado_nuevo = value || undefined;
    setFilters({ estado_nuevo, page: 1 });
    fetchHistoriales({ estado_nuevo, page: 1 });
  };

  const handleIdVentaChange = (raw: string) => {
    const id_venta = raw ? Number(raw) : undefined;
    setFilters({ id_venta, page: 1 });
    fetchHistoriales({ id_venta, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setFilters({ page: p });
      fetchHistoriales({ page: p });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">
          Historial de Ventas
        </h1>
        <p className="text-muted-foreground text-sm">
          Auditoría de cambios de estado en ventas — registro automático, solo lectura
        </p>
      </div>

      <div className="p-3 text-sm bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-lg flex items-start gap-2 font-medium">
        <Info className="size-4 shrink-0 mt-0.5" />
        <span>
          Los eventos se generan automáticamente al crear ventas, cambiar su estado o completar el pago total.
          No es posible crear, editar ni eliminar registros desde la aplicación.
        </span>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Eventos registrados
              </p>
              <h3 className="text-2xl font-black text-foreground mt-1">{count}</h3>
            </div>
            <Activity className="size-8 text-primary/40" />
          </CardContent>
        </Card>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 bg-muted/30 border border-border/30 p-4 rounded-xl"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar en estados u observaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <input
          type="number"
          placeholder="ID Venta"
          value={filters.id_venta ?? ''}
          onChange={(e) => handleIdVentaChange(e.target.value)}
          className="w-full sm:w-36 bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
        />
        <select
          value={filters.estado_nuevo ?? ''}
          onChange={(e) => handleEstadoNuevoChange(e.target.value)}
          className="w-full sm:w-44 bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        >
          {ESTADO_NUEVO_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          type="submit"
          className="bg-muted hover:bg-neutral-700 text-foreground font-bold rounded-lg text-xs uppercase tracking-wider px-6"
        >
          Buscar
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : historiales.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <History className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No hay registros</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Ajuste los filtros o registre una venta para generar eventos de auditoría
          </p>
        </div>
      ) : (
        <Card className="border-border/30 bg-muted/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Transición</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Observación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historiales.map((h) => (
                  <TableRow
                    key={h.id_historial}
                    className="hover:bg-muted/20 border-b border-border/20"
                  >
                    <TableCell className="font-mono font-bold text-muted-foreground">
                      #{h.id_historial}
                    </TableCell>
                    <TableCell className="font-mono text-foreground">#{h.id_venta}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">
                          {formatEstadoLabel(h.estado_anterior)}
                        </span>
                        <ArrowRight className="size-3 text-neutral-500 shrink-0" />
                        <span className="text-xs font-bold text-primary uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                          {formatEstadoLabel(h.estado_nuevo)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(h.fecha_cambio)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {h.id_usuario != null ? `#${h.id_usuario}` : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[240px] truncate">
                      {h.observacion || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 px-6 py-4 bg-background/40">
              <span className="text-xs text-muted-foreground font-semibold">
                Página <span className="text-foreground">{page}</span> de{' '}
                <span className="text-foreground">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePage(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg text-xs"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePage(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-lg text-xs"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
