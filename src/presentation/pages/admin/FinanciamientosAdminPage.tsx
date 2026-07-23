// src/presentation/pages/admin/FinanciamientosAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useFinanciamientoStore } from '../../store/financiamiento.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice } from '../../utils/formatters';
import type { FinanciamientoEstado } from '../../../domain/entities/financiamiento.entity';
import { transicionesFinanciamientoPermitidas } from '../../../domain/entities/financiamiento.entity';
import {
  ClipboardList,
  Search,
  Trash2,
  CreditCard,
  Percent,
  Calendar,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Info,
} from 'lucide-react';

export default function FinanciamientosAdminPage() {
  const {
    financiamientos,
    stats,
    count,
    filters,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchFinanciamientos,
    fetchStats,
    updateFinanciamientoStatus,
    deleteFinanciamiento,
    setFilters,
    clearMessages,
  } = useFinanciamientoStore();

  const [search, setSearch] = useState(filters.entidad_financiera ?? '');

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const loadData = useCallback(async () => {
    await Promise.all([fetchFinanciamientos(), fetchStats()]);
  }, [fetchFinanciamientos, fetchStats]);

  useEffect(() => {
    loadData();
    return () => {
      clearMessages();
    };
  }, [loadData, clearMessages]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ entidad_financiera: search, page: 1 });
    fetchFinanciamientos({ entidad_financiera: search, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters({ page: newPage });
      fetchFinanciamientos({ page: newPage });
    }
  };

  const handleDelete = async (id: number) => {
    if (isSaving) return;
    if (confirm('¿Está seguro de que desea eliminar este financiamiento?')) {
      await deleteFinanciamiento(id);
    }
  };

  const handleStatusChange = async (id: number, currentEstado: FinanciamientoEstado, nextEstado: FinanciamientoEstado) => {
    if (isSaving || nextEstado === currentEstado) return;
    if (confirm(`¿Cambiar el estado del financiamiento a ${nextEstado}?`)) {
      await updateFinanciamientoStatus(id, nextEstado);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">
          Módulo de Financiamientos
        </h1>
        <p className="text-muted-foreground text-sm">
          Supervisión de convenios de crédito vinculados a ventas
        </p>
      </div>

      <div className="p-3 text-sm bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-lg flex items-start gap-2 font-medium">
        <Info className="size-4 shrink-0 mt-0.5" />
        <span>
          Los financiamientos se crean desde <strong>Gestión de Ventas</strong> (acción Financiar).
          El monto financiado debe ser igual al total de la venta menos la entrada; la cuota y el saldo
          pendiente los calcula el servidor.
        </span>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 text-sm bg-green-500/10 border border-green-500/25 text-green-500 rounded-lg font-medium">
          {successMessage}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Acuerdos</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{stats.total_financiamientos}</h3>
              </div>
              <TrendingUp className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monto Total Financiado</p>
                <h3 className="text-2xl font-black text-primary mt-1">{formatPrice(stats.monto_total)}</h3>
              </div>
              <DollarSign className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cuota Promedio</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{formatPrice(stats.cuota_promedio)}</h3>
              </div>
              <CreditCard className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Plazo Promedio</p>
                <h3 className="text-2xl font-black text-foreground mt-1">{stats.plazo_promedio_meses} meses</h3>
              </div>
              <Calendar className="size-8 text-primary/40" />
            </CardContent>
          </Card>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 bg-muted/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por entidad financiera..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={filters.estado || ''}
          onChange={(e) => {
            const nextStatus = e.target.value || undefined;
            setFilters({ estado: nextStatus, page: 1 });
            fetchFinanciamientos({ estado: nextStatus, page: 1 });
          }}
          className="bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Todos los Estados</option>
          <option value="activo">Activo</option>
          <option value="pagado">Pagado</option>
          <option value="vencido">Vencido</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <Button type="submit" className="bg-muted hover:bg-neutral-700 text-foreground font-bold rounded-lg text-xs uppercase tracking-wider px-6">
          Buscar
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : financiamientos.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <ClipboardList className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No se encontraron financiamientos</h3>
          <p className="text-muted-foreground text-sm mt-1">Registre un financiamiento desde una venta pendiente</p>
        </div>
      ) : (
        <Card className="border-border/30 bg-muted/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background">
                <TableRow>
                  <TableHead className="w-[70px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead className="text-right">Entrada</TableHead>
                  <TableHead className="text-right">Monto Financiado</TableHead>
                  <TableHead className="text-right">Saldo Pend.</TableHead>
                  <TableHead className="text-center">Tasa</TableHead>
                  <TableHead className="text-center">Plazo</TableHead>
                  <TableHead className="text-right">Cuota</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[140px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financiamientos.map((fin) => {
                  const transiciones = transicionesFinanciamientoPermitidas(fin.estado);
                  return (
                    <TableRow key={fin.id_financiamiento} className="hover:bg-muted/20 border-b border-border/20">
                      <TableCell className="font-mono font-bold text-muted-foreground">
                        #{fin.id_financiamiento}
                      </TableCell>
                      <TableCell className="font-mono">#{fin.id_venta}</TableCell>
                      <TableCell className="font-bold text-foreground">{fin.entidad_financiera}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatPrice(fin.entrada)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(fin.monto_financiado)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatPrice(fin.saldo_pendiente)}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5">
                          {fin.tasa_interes}% <Percent className="size-3 text-neutral-500" />
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-medium">{fin.plazo_meses} meses</TableCell>
                      <TableCell className="text-right font-black text-primary">
                        {formatPrice(fin.cuota_mensual)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={fin.estado} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1.5 py-2">
                          {transiciones.length > 0 ? (
                            <select
                              disabled={isSaving}
                              defaultValue=""
                              onChange={(e) => {
                                const next = e.target.value as FinanciamientoEstado;
                                if (next) {
                                  handleStatusChange(fin.id_financiamiento, fin.estado, next);
                                  e.target.value = '';
                                }
                              }}
                              className="text-xs bg-background border border-border/30 rounded-lg px-2 py-1.5 max-w-[100px]"
                              title="Cambiar estado"
                            >
                              <option value="">Estado…</option>
                              {transiciones.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[10px] text-muted-foreground uppercase">Final</span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={isSaving}
                            onClick={() => handleDelete(fin.id_financiamiento)}
                            title="Eliminar Financiamiento"
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded-lg text-xs"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
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
