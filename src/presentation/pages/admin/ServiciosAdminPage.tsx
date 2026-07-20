import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Search,
  Settings,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';

import { useServicioStore } from '../../store/servicio.store';

import type {
  Servicio,
} from '../../../domain/entities/servicio.entity';

import type {
  ServicioDto,
  ServicioFilters,
} from '../../../application/dtos/servicio.dto';

import {
  servicioSchema,
} from '../../../application/dtos/servicio.dto';

interface ServicioFormState {
  nombre: string;
  descripcion: string;
  precio_base: string;
  tiempo_estimado_minutos: string;
  estado: boolean;
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  precio_base?: string;
  tiempo_estimado_minutos?: string;
  general?: string;
}

const initialFormState: ServicioFormState = {
  nombre: '',
  descripcion: '',
  precio_base: '',
  tiempo_estimado_minutos: '',
  estado: true,
};

const formatCurrency = (value: string | number): string => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(parsedValue);
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
};

export default function ServiciosAdminPage() {
  const {
    servicios,
    stats,
    count,
    filters,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchServicios,
    fetchStats,
    createServicio,
    updateServicio,
    deleteServicio,
    clearMessages,
  } = useServicioStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [ordering, setOrdering] =
    useState<ServicioFilters['ordering']>('nombre');

  const [isFormModalOpen, setIsFormModalOpen] =
    useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [selectedServicio, setSelectedServicio] =
    useState<Servicio | null>(null);

  const [formData, setFormData] =
    useState<ServicioFormState>(initialFormState);

  const [formErrors, setFormErrors] =
    useState<FormErrors>({});

  const currentPage = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(count / pageSize));
  }, [count, pageSize]);

  useEffect(() => {
    void fetchServicios();
    void fetchStats();
  }, [fetchServicios, fetchStats]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const estado =
        estadoFilter === ''
          ? undefined
          : estadoFilter === 'true';

      void fetchServicios({
        page: 1,
        search: searchTerm.trim() || undefined,
        estado,
        ordering,
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    searchTerm,
    estadoFilter,
    ordering,
    fetchServicios,
  ]);

  useEffect(() => {
    if (!error && !successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      clearMessages();
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [error, successMessage, clearMessages]);

  const resetForm = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setSelectedServicio(null);
  };

  const handleOpenCreateModal = () => {
    clearMessages();
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (servicio: Servicio) => {
    clearMessages();
    setSelectedServicio(servicio);

    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion ?? '',
      precio_base: servicio.precio_base,
      tiempo_estimado_minutos:
        servicio.tiempo_estimado_minutos.toString(),
      estado: servicio.estado,
    });

    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (isSaving) {
      return;
    }

    setIsFormModalOpen(false);
    resetForm();
  };

  const handleOpenDeleteModal = (
    servicio: Servicio,
  ) => {
    clearMessages();
    setSelectedServicio(servicio);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isSaving) {
      return;
    }

    setIsDeleteModalOpen(false);
    setSelectedServicio(null);
  };

  const validateForm = (): ServicioDto | null => {
    setFormErrors({});

    const tiempo = Number(
      formData.tiempo_estimado_minutos,
    );

    const dto: ServicioDto = {
      nombre: formData.nombre.trim(),
      descripcion:
        formData.descripcion.trim() || null,
      precio_base: formData.precio_base.trim(),
      tiempo_estimado_minutos: tiempo,
      estado: formData.estado,
    };

    const result = servicioSchema.safeParse(dto);

    if (result.success) {
      return result.data;
    }

    const errors: FormErrors = {};

    result.error.issues.forEach((issue) => {
      const field = issue.path[0];

      if (
        field === 'nombre' ||
        field === 'descripcion' ||
        field === 'precio_base' ||
        field === 'tiempo_estimado_minutos'
      ) {
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
    });

    setFormErrors(errors);

    return null;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const dto = validateForm();

    if (!dto) {
      return;
    }

    const success = selectedServicio
      ? await updateServicio(selectedServicio.id, dto)
      : await createServicio(dto);

    if (success) {
      setIsFormModalOpen(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!selectedServicio) {
      return;
    }

    const success = await deleteServicio(
      selectedServicio.id,
    );

    if (success) {
      setIsDeleteModalOpen(false);
      setSelectedServicio(null);
    }
  };

  const handleToggleEstado = async (
    servicio: Servicio,
  ) => {
    await updateServicio(servicio.id, {
      estado: !servicio.estado,
    });
  };

  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    const estado =
      estadoFilter === ''
        ? undefined
        : estadoFilter === 'true';

    void fetchServicios({
      page,
      search: searchTerm.trim() || undefined,
      estado,
      ordering,
    });
  };

  const displayedRange = useMemo(() => {
    if (count === 0) {
      return '0 resultados';
    }

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, count);

    return `${start}-${end} de ${count}`;
  }, [count, currentPage, pageSize]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            Abastecimiento
          </p>

          <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            Gestión de servicios
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            Administra los servicios del taller, precios y tiempos estimados.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(255,26,26,0.25)] transition-all hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Nuevo servicio
        </button>
      </section>

      {successMessage && (
        <div className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-3 text-center text-xs font-semibold text-green-400">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de servicios"
          value={stats?.total ?? count}
          icon={<Settings className="size-5" />}
        />

        <StatCard
          title="Servicios activos"
          value={stats?.activos ?? 0}
          icon={<ToggleRight className="size-5" />}
        />

        <StatCard
          title="Servicios inactivos"
          value={stats?.inactivos ?? 0}
          icon={<ToggleLeft className="size-5" />}
        />

        <StatCard
          title="Precio promedio"
          value={formatCurrency(
            stats?.detail?.length
              ? stats.detail.reduce(
                  (total, servicio) =>
                    total + Number(servicio.precio_base),
                  0,
                ) / stats.detail.length
              : 0,
          )}
          icon={<DollarSign className="size-5" />}
        />
      </section>

      <section className="rounded-[2rem] border border-neutral-900 bg-[#0c0c0e] p-4 shadow-2xl md:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="w-full rounded-full border border-neutral-800 bg-[#141417] py-3 pl-11 pr-11 text-sm font-semibold text-white placeholder:text-neutral-600 focus:border-primary/80 focus:outline-none focus:ring-4 focus:ring-primary/10"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <select
            value={estadoFilter}
            onChange={(event) => setEstadoFilter(event.target.value)}
            className="rounded-full border border-neutral-800 bg-[#141417] px-5 py-3 text-sm font-semibold text-white outline-none focus:border-primary"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <select
            value={ordering}
            onChange={(event) =>
              setOrdering(
                event.target.value as ServicioFilters['ordering'],
              )
            }
            className="rounded-full border border-neutral-800 bg-[#141417] px-5 py-3 text-sm font-semibold text-white outline-none focus:border-primary"
          >
            <option value="nombre">Nombre A-Z</option>
            <option value="-nombre">Nombre Z-A</option>
            <option value="precio_base">Menor precio</option>
            <option value="-precio_base">Mayor precio</option>
            <option value="tiempo_estimado_minutos">Menor duración</option>
            <option value="-tiempo_estimado_minutos">Mayor duración</option>
            <option value="-fecha_creacion">Más recientes</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-neutral-900 bg-[#0c0c0e] shadow-2xl">
        {isLoading && servicios.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : servicios.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
            <Wrench className="mb-4 size-12 text-neutral-700" />

            <h2 className="text-lg font-black uppercase text-white">
              No se encontraron servicios
            </h2>

            <p className="mt-2 max-w-md text-sm text-neutral-500">
              Modifica los filtros de búsqueda o registra un nuevo servicio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-950 text-xs font-black uppercase tracking-wider text-neutral-400">
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Precio base</th>
                  <th className="px-6 py-4">Tiempo estimado</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-950 text-sm">
                {servicios.map((servicio) => (
                  <tr
                    key={servicio.id}
                    className="transition-colors hover:bg-neutral-900/20"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                          <Wrench className="size-4" />
                        </div>

                        <div className="max-w-md">
                          <p className="font-bold text-white">
                            {servicio.nombre}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs text-neutral-600">
                            {servicio.descripcion || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-white">
                      {formatCurrency(servicio.precio_base)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-neutral-300">
                        <Clock3 className="size-3.5 text-neutral-600" />
                        {formatDuration(servicio.tiempo_estimado_minutos)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => void handleToggleEstado(servicio)}
                        className="disabled:cursor-default"
                        title="Cambiar estado"
                      >
                        {servicio.estado ? (
                          <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase text-green-400">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-bold uppercase text-neutral-500">
                            Inactivo
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(servicio)}
                          className="rounded-full bg-neutral-900 p-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white"
                          title="Editar servicio"
                        >
                          <Edit className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(servicio)}
                          className="rounded-full bg-destructive/10 p-2 text-destructive transition-all hover:bg-destructive/20"
                          title="Eliminar servicio"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-neutral-950 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-neutral-500">
            Mostrando {displayedRange}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex size-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="min-w-24 text-center text-xs font-bold text-neutral-400">
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex size-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border border-neutral-900 bg-[#0c0c0e] p-7 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
                  Servicios
                </p>

                <h2 className="mt-2 text-2xl font-black uppercase text-white">
                  {selectedServicio ? 'Editar servicio' : 'Nuevo servicio'}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseFormModal}
                disabled={isSaving}
                className="rounded-full bg-neutral-900 p-2 text-neutral-500 transition-colors hover:text-white disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField
                label="Nombre del servicio"
                required
                error={formErrors.nombre}
              >
                <input
                  type="text"
                  maxLength={150}
                  value={formData.nombre}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      nombre: event.target.value,
                    }))
                  }
                  placeholder="Ej: Mantenimiento preventivo"
                  className={inputClass(Boolean(formErrors.nombre))}
                />
              </FormField>

              <FormField
                label="Descripción"
                error={formErrors.descripcion}
              >
                <textarea
                  rows={4}
                  value={formData.descripcion}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      descripcion: event.target.value,
                    }))
                  }
                  placeholder="Describe las actividades incluidas..."
                  className={textareaClass(
                    Boolean(formErrors.descripcion),
                  )}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  label="Precio base"
                  required
                  error={formErrors.precio_base}
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_base}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        precio_base: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className={inputClass(
                      Boolean(formErrors.precio_base),
                    )}
                  />
                </FormField>

                <FormField
                  label="Tiempo estimado (minutos)"
                  required
                  error={formErrors.tiempo_estimado_minutos}
                >
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.tiempo_estimado_minutos}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        tiempo_estimado_minutos:
                          event.target.value,
                      }))
                    }
                    placeholder="Ej: 60"
                    className={inputClass(
                      Boolean(
                        formErrors.tiempo_estimado_minutos,
                      ),
                    )}
                  />
                </FormField>
              </div>

              <div className="flex items-center justify-between rounded-[1.5rem] border border-neutral-800 bg-[#141417] px-5 py-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-white">
                    Servicio activo
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Permite seleccionarlo en mantenimientos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      estado: !current.estado,
                    }))
                  }
                >
                  {formData.estado ? (
                    <ToggleRight className="size-9 text-primary" />
                  ) : (
                    <ToggleLeft className="size-9 text-neutral-600" />
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleCloseFormModal}
                  className="w-full rounded-full border border-neutral-800 py-4 text-xs font-black uppercase tracking-wider text-neutral-400 transition-colors hover:text-white disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(255,26,26,0.25)] transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving && (
                    <Loader2 className="size-4 animate-spin" />
                  )}

                  {isSaving
                    ? 'Guardando...'
                    : selectedServicio
                      ? 'Actualizar'
                      : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedServicio && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2.5rem] border border-neutral-900 bg-[#0c0c0e] p-8 shadow-2xl">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
              <Trash2 className="size-6" />
            </div>

            <h2 className="text-center text-xl font-black uppercase text-white">
              Eliminar servicio
            </h2>

            <p className="mt-3 text-center text-sm leading-relaxed text-neutral-400">
              Se eliminará el servicio{' '}
              <span className="font-bold text-white">
                {selectedServicio.nombre}
              </span>
              . Esta acción no se puede deshacer.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCloseDeleteModal}
                className="w-full rounded-full border border-neutral-800 py-3 text-xs font-black uppercase text-neutral-400 transition-colors hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleDelete()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-destructive py-3 text-xs font-black uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSaving && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-neutral-900 bg-[#0c0c0e] p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-neutral-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {value}
          </p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </article>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({
  label,
  required = false,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wider text-neutral-400">
        {label}

        {required && (
          <span className="ml-1 text-primary">*</span>
        )}
      </label>

      {children}

      {error && (
        <p className="px-2 text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return [
    'w-full rounded-full border bg-[#141417] px-5 py-3 text-sm font-semibold text-white',
    'placeholder:text-neutral-600 focus:outline-none focus:ring-4 focus:ring-primary/10',
    hasError
      ? 'border-destructive'
      : 'border-neutral-800 focus:border-primary/80',
  ].join(' ');
}

function textareaClass(hasError: boolean): string {
  return [
    'h-28 w-full resize-none rounded-[1.5rem] border bg-[#141417] px-5 py-3',
    'text-sm font-semibold text-white placeholder:text-neutral-600',
    'focus:outline-none focus:ring-4 focus:ring-primary/10',
    hasError
      ? 'border-destructive'
      : 'border-neutral-800 focus:border-primary/80',
  ].join(' ');
}
