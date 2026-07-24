// src/presentation/pages/admin/HistorialVentasAdminPage.tsx
import { useEffect, useMemo, useState, useCallback, type FormEvent } from 'react';
import { useHistorialEstadoVentaStore } from '../../store/historial-estado-venta.store';
import type { HistorialEstadoVenta } from '../../../domain/entities/historial-estado-venta.entity';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDateTimeParts } from '../../utils/formatters';
import {
  AlertCircle, Ban, CheckCircle2, Eye, FilePlus2,
  History, Info, RefreshCw, Search, Activity, X,
} from 'lucide-react';

type EventoTipo = 'creada' | 'completada' | 'anulada' | 'actualizado';
type EventoFiltro = 'todos' | EventoTipo;

interface EventoVista {
  tipo: EventoTipo;
  titulo: string;
  icon: typeof FilePlus2;
  badgeClass: string;
}

const EVENTO_FILTRO_OPTIONS: Array<{ value: EventoFiltro; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'creada', label: 'Ventas creadas' },
  { value: 'completada', label: 'Ventas completadas' },
  { value: 'anulada', label: 'Ventas anuladas' },
  { value: 'actualizado', label: 'Actualizaciones' },
];

function isEstadoVacio(estado: string): boolean {
  return !estado.trim();
}

function labelEstado(estado: string): string {
  if (isEstadoVacio(estado)) return 'Nuevo registro';
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    completada: 'Completada',
    anulada: 'Anulada',
  };
  return map[estado.trim().toLowerCase()] ?? estado;
}

/** Interpreta la transición de la API como evento de negocio (sin datos inventados). */
function resolverEvento(h: HistorialEstadoVenta): EventoVista {
  const anterior = h.estado_anterior.trim().toLowerCase();
  const nuevo = h.estado_nuevo.trim().toLowerCase();

  if (isEstadoVacio(h.estado_anterior) && nuevo === 'pendiente') {
    return {
      tipo: 'creada',
      titulo: 'Venta creada',
      icon: FilePlus2,
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    };
  }
  if (anterior === 'pendiente' && nuevo === 'completada') {
    return {
      tipo: 'completada',
      titulo: 'Venta completada',
      icon: CheckCircle2,
      badgeClass: 'bg-green-500/10 text-green-400 border-green-500/25',
    };
  }
  if (anterior === 'pendiente' && nuevo === 'anulada') {
    return {
      tipo: 'anulada',
      titulo: 'Venta anulada',
      icon: Ban,
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/25',
    };
  }
  return {
    tipo: 'actualizado',
    titulo: 'Estado actualizado',
    icon: RefreshCw,
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  };
}

function labelResponsable(idUsuario: number | null): string {
  if (idUsuario == null) return 'Sistema';
  return `Usuario #${idUsuario}`;
}

function EstadoTransicion({ nuevo }: { nuevo: string }) {
  if (!nuevo.trim()) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <span title={`Estado nuevo: ${labelEstado(nuevo)}`}>
      <StatusBadge status={nuevo} />
    </span>
  );
}

function FechaHora({ iso }: { iso: string }) {
  const { date, time } = formatDateTimeParts(iso);
  return (
    <div className="leading-tight" title={`${date} ${time}`}>
      <p className="text-sm font-semibold text-foreground">{date}</p>
      <p className="text-xs text-muted-foreground font-mono">{time}</p>
    </div>
  );
}

function DetalleCelda({
  texto,
  onVerMas,
}: {
  texto: string;
  onVerMas: () => void;
}) {
  const limpio = texto.trim();
  if (!limpio) {
    return <span className="text-xs text-muted-foreground italic">Sin observaciones</span>;
  }
  const largo = limpio.length > 80 || limpio.split(/\s+/).length > 14;
  return (
    <div className="max-w-[240px]">
      <p className="text-xs text-muted-foreground line-clamp-2">{limpio}</p>
      {largo && (
        <button
          type="button"
          onClick={onVerMas}
          className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
        >
          Ver más
        </button>
      )}
    </div>
  );
}

function EventoBadge({ evento }: { evento: EventoVista }) {
  const Icon = evento.icon;
  return (
    <div className="flex items-center gap-2.5 min-w-0" title={evento.titulo}>
      <span
        className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg border ${evento.badgeClass}`}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <span className="text-sm font-bold text-foreground leading-tight">{evento.titulo}</span>
    </div>
  );
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

  const [idVentaInput, setIdVentaInput] = useState(
    filters.id_venta != null ? String(filters.id_venta) : '',
  );
  const [eventoFiltro, setEventoFiltro] = useState<EventoFiltro>('todos');
  const [selected, setSelected] = useState<HistorialEstadoVenta | null>(null);

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

  /** Filtro de tipo de evento solo sobre la página ya cargada (sin N+1 ni backend nuevo). */
  const visibles = useMemo(() => {
    if (eventoFiltro === 'todos') return historiales;
    return historiales.filter((h) => resolverEvento(h).tipo === eventoFiltro);
  }, [historiales, eventoFiltro]);

  const pageStats = useMemo(() => {
    let creadas = 0;
    let completadas = 0;
    let anuladas = 0;
    for (const h of historiales) {
      const t = resolverEvento(h).tipo;
      if (t === 'creada') creadas += 1;
      else if (t === 'completada') completadas += 1;
      else if (t === 'anulada') anuladas += 1;
    }
    return {
      total: historiales.length,
      creadas,
      completadas,
      anuladas,
    };
  }, [historiales]);

  /** Timeline de la venta: solo eventos ya presentes en la página cargada. */
  const timelineVenta = useMemo(() => {
    if (!selected) return [];
    return historiales
      .filter((h) => h.id_venta === selected.id_venta)
      .slice()
      .sort(
        (a, b) =>
          new Date(a.fecha_cambio).getTime() - new Date(b.fecha_cambio).getTime(),
      );
  }, [historiales, selected]);

  const handleBuscarVenta = (e: FormEvent) => {
    e.preventDefault();
    const raw = idVentaInput.trim();
    const id_venta = raw ? Number(raw) : undefined;
    if (raw && Number.isNaN(id_venta)) return;
    setFilters({ id_venta, page: 1 });
    fetchHistoriales({ id_venta, page: 1 });
  };

  const handlePage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setFilters({ page: p });
      fetchHistoriales({ page: p });
    }
  };

  const openDetalle = (h: HistorialEstadoVenta) => setSelected(h);
  const closeDetalle = () => setSelected(null);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">
          Historial de Ventas
        </h1>
        <p className="text-muted-foreground text-sm">
          Historial de eventos del negocio: qué ocurrió, sobre qué venta, quién y por qué.
        </p>
      </div>

      <div className="p-3 text-sm bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-lg flex items-start gap-2 font-medium">
        <Info className="size-4 shrink-0 mt-0.5" />
        <span>
          Eventos generados automáticamente al crear ventas, cambiar estado o completar el pago.
          Solo lectura. Los totales por tipo se calculan sobre la página cargada.
        </span>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/25 text-destructive rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Resumen — explícitamente "en esta página" */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          En esta página
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total eventos
                </p>
                <h3 className="text-2xl font-black text-foreground mt-1">{pageStats.total}</h3>
              </div>
              <Activity className="size-7 text-primary/40 shrink-0" aria-hidden />
            </CardContent>
          </Card>
          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Ventas creadas
                </p>
                <h3 className="text-2xl font-black text-blue-400 mt-1">{pageStats.creadas}</h3>
              </div>
              <FilePlus2 className="size-7 text-blue-400/40 shrink-0" aria-hidden />
            </CardContent>
          </Card>
          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Completadas
                </p>
                <h3 className="text-2xl font-black text-green-400 mt-1">{pageStats.completadas}</h3>
              </div>
              <CheckCircle2 className="size-7 text-green-400/40 shrink-0" aria-hidden />
            </CardContent>
          </Card>
          <Card className="border-border/30 bg-muted/30 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Anuladas
                </p>
                <h3 className="text-2xl font-black text-red-400 mt-1">{pageStats.anuladas}</h3>
              </div>
              <Ban className="size-7 text-red-400/40 shrink-0" aria-hidden />
            </CardContent>
          </Card>
        </div>
        {count > historiales.length && (
          <p className="text-[11px] text-muted-foreground">
            Hay {count} eventos en total en el sistema; las tarjetas reflejan solo esta página ({historiales.length}).
          </p>
        )}
      </div>

      {/* Filtros */}
      <form
        onSubmit={handleBuscarVenta}
        className="flex flex-col lg:flex-row gap-3 bg-muted/30 border border-border/30 p-4 rounded-xl"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Buscar por ID de venta"
            value={idVentaInput}
            onChange={(e) => setIdVentaInput(e.target.value)}
            className="w-full bg-background border border-border/30 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            aria-label="Buscar por ID de venta"
          />
        </div>
        <select
          value={eventoFiltro}
          onChange={(e) => setEventoFiltro(e.target.value as EventoFiltro)}
          className="w-full lg:w-56 bg-background border border-border/30 rounded-lg px-4 py-2 text-sm text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          aria-label="Filtrar por tipo de evento"
          title="Filtro local sobre la página cargada"
        >
          {EVENTO_FILTRO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
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
        {(filters.id_venta != null || eventoFiltro !== 'todos') && (
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={() => {
              setIdVentaInput('');
              setEventoFiltro('todos');
              setFilters({ id_venta: undefined, page: 1 });
              fetchHistoriales({ id_venta: undefined, page: 1 });
            }}
          >
            Limpiar
          </Button>
        )}
      </form>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : visibles.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border/30 rounded-2xl">
          <History className="size-12 mx-auto text-neutral-500 mb-4" aria-hidden />
          <h3 className="text-lg font-bold text-foreground">No hay eventos</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Ajuste los filtros o registre una venta para generar eventos
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="border-border/30 bg-muted/10 backdrop-blur-md overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-background">
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Venta</TableHead>
                    <TableHead>Cambio de estado</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibles.map((h) => {
                    const evento = resolverEvento(h);
                    return (
                      <TableRow
                        key={h.id_historial}
                        className="hover:bg-muted/20 border-b border-border/20"
                      >
                        <TableCell>
                          <EventoBadge evento={evento} />
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold text-foreground">
                            Venta #{h.id_venta}
                          </span>
                        </TableCell>
                        <TableCell>
                          <EstadoTransicion nuevo={h.estado_nuevo} />
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-sm font-semibold text-foreground"
                            title={
                              h.id_usuario == null
                                ? 'Sin usuario asociado (proceso automático o sin actor)'
                                : `id_usuario=${h.id_usuario}`
                            }
                          >
                            {labelResponsable(h.id_usuario)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <FechaHora iso={h.fecha_cambio} />
                        </TableCell>
                        <TableCell>
                          <DetalleCelda
                            texto={h.observacion}
                            onVerMas={() => openDetalle(h)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-[10px] font-bold uppercase tracking-wider h-8"
                            title="Ver detalle del evento"
                            onClick={() => openDetalle(h)}
                          >
                            <Eye className="size-3.5" aria-hidden />
                            Ver detalle
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {visibles.map((h) => {
              const evento = resolverEvento(h);
              return (
                <Card
                  key={h.id_historial}
                  className="border-border/30 bg-muted/10"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <EventoBadge evento={evento} />
                      <FechaHora iso={h.fecha_cambio} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">Venta #{h.id_venta}</span>
                      <EstadoTransicion nuevo={h.estado_nuevo} />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-xs font-bold uppercase"
                      onClick={() => openDetalle(h)}
                    >
                      <Eye className="size-3.5" aria-hidden />
                      Ver detalle
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-semibold">
                Página <span className="text-foreground">{page}</span> de{' '}
                <span className="text-foreground">{totalPages}</span>
                {' · '}
                {count} eventos en total
              </p>
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
        </>
      )}

      {/* Modal detalle + timeline (solo datos de la página cargada) */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="historial-detalle-titulo"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeDetalle}
          />
          <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-card border border-border/40 rounded-t-2xl sm:rounded-2xl shadow-2xl">
            {(() => {
              const evento = resolverEvento(selected);
              const Icon = evento.icon;
              return (
                <>
                  <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-border/30 bg-muted/80 backdrop-blur-md">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg border shrink-0 ${evento.badgeClass}`}>
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <h2
                          id="historial-detalle-titulo"
                          className="text-lg font-extrabold text-foreground tracking-tight truncate"
                        >
                          {evento.titulo}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Evento #{selected.id_historial} · Venta #{selected.id_venta}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={closeDetalle}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                      aria-label="Cerrar"
                    >
                      <X className="size-5" />
                    </Button>
                  </div>

                  <div className="p-5 space-y-5 text-sm">
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Evento
                        </dt>
                        <dd className="font-semibold text-foreground mt-1">{evento.titulo}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Venta
                        </dt>
                        <dd className="font-semibold text-foreground mt-1">
                          Venta #{selected.id_venta}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Estado anterior
                        </dt>
                        <dd className="mt-1">
                          {isEstadoVacio(selected.estado_anterior) ? (
                            <span className="text-xs text-muted-foreground">Nuevo registro</span>
                          ) : (
                            <StatusBadge status={selected.estado_anterior} />
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Estado nuevo
                        </dt>
                        <dd className="mt-1">
                          {selected.estado_nuevo.trim() ? (
                            <StatusBadge status={selected.estado_nuevo} />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Responsable
                        </dt>
                        <dd className="font-semibold text-foreground mt-1">
                          {labelResponsable(selected.id_usuario)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Fecha
                        </dt>
                        <dd className="mt-1">
                          <FechaHora iso={selected.fecha_cambio} />
                        </dd>
                      </div>
                    </dl>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        Observación
                      </p>
                      <p className="text-foreground whitespace-pre-wrap rounded-lg border border-border/30 bg-muted/20 px-3 py-2.5">
                        {selected.observacion.trim() || 'Sin observaciones'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Timeline · Venta #{selected.id_venta}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Solo eventos de esta página
                        </p>
                      </div>
                      <div className="relative space-y-0 border-l-2 border-border/40 ml-3 pl-5">
                        {timelineVenta.map((item, idx) => {
                          const ev = resolverEvento(item);
                          const ItemIcon = ev.icon;
                          const { date, time } = formatDateTimeParts(item.fecha_cambio);
                          const isCurrent = item.id_historial === selected.id_historial;
                          return (
                            <div
                              key={item.id_historial}
                              className={`relative pb-5 last:pb-0 ${isCurrent ? 'opacity-100' : 'opacity-90'}`}
                            >
                              <span
                                className={`absolute -left-[1.6rem] top-0 flex size-6 items-center justify-center rounded-full border bg-card ${ev.badgeClass}`}
                                aria-hidden
                              >
                                <ItemIcon className="size-3" />
                              </span>
                              <div
                                className={`rounded-lg border px-3 py-2.5 ${
                                  isCurrent
                                    ? 'border-primary/40 bg-primary/5'
                                    : 'border-border/30 bg-muted/10'
                                }`}
                              >
                                <p className="text-sm font-bold text-foreground">{ev.titulo}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {date} · {time}
                                </p>
                                <p className="text-xs font-semibold text-foreground mt-1">
                                  {labelResponsable(item.id_usuario)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                                  {item.observacion.trim() || 'Sin observaciones'}
                                </p>
                              </div>
                              {idx < timelineVenta.length - 1 && (
                                <span className="sr-only">Siguiente evento</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {timelineVenta.length <= 1 && (
                        <p className="text-[11px] text-muted-foreground mt-2">
                          Si hay más eventos de esta venta en otras páginas, no aparecen aquí (sin consultas extra).
                        </p>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
