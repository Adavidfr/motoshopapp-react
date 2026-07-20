// src/presentation/pages/admin/FinanciamientosAdminPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useFinanciamientoStore } from '../../store/financiamiento.store';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatPrice } from '../../utils/formatters';
import {
  ClipboardList,
  Search,
  Trash2,
  CreditCard,
  Percent,
  Calendar,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import type { FinanciamientoEstado } from '../../../domain/entities/financiamiento.entity';

export default function FinanciamientosAdminPage() {
  const {
    financiamientos,
    stats,
    count,
    filters,
    isLoading,
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
    await Promise.all([
      fetchFinanciamientos(),
      fetchStats(),
    ]);
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
    if (confirm('¿Está seguro de que desea eliminar este financiamiento?')) {
      await deleteFinanciamiento(id);
      loadData();
    }
  };

  const handleStatusChange = async (id: number, currentEstado: string) => {
    // Rotar estado para simplificar en la interfaz admin
    let nextEstado: FinanciamientoEstado = 'activo';
    if (currentEstado === 'activo') nextEstado = 'pagado';
    else if (currentEstado === 'pagado') nextEstado = 'vencido';
    else if (currentEstado === 'vencido') nextEstado = 'cancelado';
    else if (currentEstado === 'cancelado') nextEstado = 'activo';

    if (confirm(`¿Cambiar el estado del financiamiento a ${nextEstado}?`)) {
      await updateFinanciamientoStatus(id, nextEstado);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Módulo de Financiamientos</h1>
        <p className="text-muted-foreground text-sm">Gestiona y supervisa los convenios de financiamiento y créditos otorgados</p>
      </div>

      {/* Messages */}
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Acuerdos</p>
                <h3 className="text-2xl font-black text-white mt-1">{stats.total_financiamientos}</h3>
              </div>
              <TrendingUp className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Monto Total Financiado</p>
                <h3 className="text-2xl font-black text-primary mt-1">{formatPrice(stats.monto_total)}</h3>
              </div>
              <DollarSign className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Cuota Promedio</p>
                <h3 className="text-2xl font-black text-white mt-1">{formatPrice(stats.cuota_promedio)}</h3>
              </div>
              <CreditCard className="size-8 text-primary/40" />
            </CardContent>
          </Card>

          <Card className="border-border/30 bg-neutral-900/30 backdrop-blur-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Plazo Promedio</p>
                <h3 className="text-2xl font-black text-white mt-1">{stats.plazo_promedio_meses} meses</h3>
              </div>
              <Calendar className="size-8 text-primary/40" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 bg-neutral-900/30 border border-border/30 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por entidad financiera..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={filters.estado || ''}
          onChange={(e) => {
            const nextStatus = e.target.value || undefined;
            setFilters({ estado: nextStatus, page: 1 });
            fetchFinanciamientos({ estado: nextStatus, page: 1 });
          }}
          className="bg-neutral-950 border border-border/30 rounded-lg px-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">Todos los Estados</option>
          <option value="activo">Activo</option>
          <option value="pagado">Pagado</option>
          <option value="vencido">Vencido</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <Button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider px-6">
          Buscar
        </Button>
      </form>

      {/* Table Section */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : financiamientos.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 border border-border/30 rounded-2xl">
          <ClipboardList className="size-12 mx-auto text-neutral-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">No se encontraron financiamientos</h3>
          <p className="text-muted-foreground text-sm mt-1">Intente ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <Card className="border-border/30 bg-neutral-900/10 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-950">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Venta</TableHead>
                  <TableHead>Entidad Financiera</TableHead>
                  <TableHead className="text-right">Monto Financiado</TableHead>
                  <TableHead className="text-center">Tasa Interés</TableHead>
                  <TableHead className="text-center">Plazo</TableHead>
                  <TableHead className="text-right">Cuota Mensual</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[120px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financiamientos.map((fin) => (
                  <TableRow key={fin.id_financiamiento} className="hover:bg-neutral-900/20 border-b border-border/20">
                    <TableCell className="font-mono font-bold text-neutral-400">#{fin.id_financiamiento}</TableCell>
                    <TableCell className="font-mono">#{fin.id_venta}</TableCell>
                    <TableCell className="font-bold text-white">{fin.entidad_financiera}</TableCell>
                    <TableCell className="text-right font-semibold text-neutral-200">
                      {formatPrice(fin.monto_financiado)}
                    </TableCell>
                    <TableCell className="text-center text-neutral-300">
                      <span className="inline-flex items-center gap-0.5">
                        {fin.tasa_interes}% <Percent className="size-3 text-neutral-500" />
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium text-white">{fin.plazo_meses} meses</TableCell>
                    <TableCell className="text-right font-black text-primary">
                      {formatPrice(fin.cuota_mensual)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={fin.estado} />
                    </TableCell>
                    <TableCell className="flex items-center justify-center gap-1.5 py-3">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleStatusChange(fin.id_financiamiento, fin.estado)}
                        title="Rotar Estado de Financiamiento"
                        className="text-primary hover:bg-primary/10"
                      >
                        <CreditCard className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(fin.id_financiamiento)}
                        title="Eliminar Financiamiento"
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/30 px-6 py-4 bg-neutral-950/40">
              <span className="text-xs text-neutral-400 font-semibold">
                Página <span className="text-white">{page}</span> de <span className="text-white">{totalPages}</span>
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
