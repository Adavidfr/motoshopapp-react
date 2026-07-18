import { useEffect, useMemo, useState } from 'react';
import {
  Clock3,
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Search,
  Settings,
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

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-neutral-900">
      {/* Encabezado */}
      <section className="border-b border-neutral-800 bg-[#070708]">
        <div className="container mx-auto max-w-screen-2xl px-4 py-10 sm:px-6">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Wrench className="size-5 text-primary" />

                <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                  Abastecimiento y taller
                </span>
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Gestión de servicios
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                Administra los servicios del taller,
                precios y tiempos estimados.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 bg-primary px-5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Nuevo servicio
            </button>
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-screen-2xl space-y-8 px-4 py-8 sm:px-6">
        {/* Mensajes */}
        {successMessage && (
          <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Estadísticas */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Total de servicios
                </p>

                <p className="mt-2 text-3xl font-black text-neutral-900">
                  {stats?.total ?? 0}
                </p>
              </div>

              <div className="flex size-11 items-center justify-center bg-neutral-100">
                <Settings className="size-5 text-neutral-700" />
              </div>
            </div>
          </article>

          <article className="border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Servicios activos
                </p>

                <p className="mt-2 text-3xl font-black text-green-600">
                  {stats?.activos ?? 0}
                </p>
              </div>

              <div className="flex size-11 items-center justify-center bg-green-50">
                <Eye className="size-5 text-green-600" />
              </div>
            </div>
          </article>

          <article className="border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Servicios inactivos
                </p>

                <p className="mt-2 text-3xl font-black text-red-600">
                  {stats?.inactivos ?? 0}
                </p>
              </div>

              <div className="flex size-11 items-center justify-center bg-red-50">
                <EyeOff className="size-5 text-red-600" />
              </div>
            </div>
          </article>

          <article className="border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Precio promedio
                </p>

                <p className="mt-2 text-2xl font-black text-primary">
                  {formatCurrency(
                    stats?.detail?.length
                      ? stats.detail.reduce(
                          (total, servicio) =>
                            total +
                            Number(
                              servicio.precio_base,
                            ),
                          0,
                        ) / stats.detail.length
                      : 0,
                  )}
                </p>
              </div>

              <div className="flex size-11 items-center justify-center bg-red-50">
                <DollarSign className="size-5 text-primary" />
              </div>
            </div>
          </article>
        </section>

        {/* Filtros */}
        <section className="border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Buscar por nombre o descripción..."
                className="h-11 w-full border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-primary"
              />
            </div>

            <select
              value={estadoFilter}
              onChange={(event) =>
                setEstadoFilter(event.target.value)
              }
              className="h-11 border border-neutral-300 bg-white px-4 text-sm font-semibold outline-none focus:border-primary"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>

            <select
              value={ordering}
              onChange={(event) =>
                setOrdering(
                  event.target
                    .value as ServicioFilters['ordering'],
                )
              }
              className="h-11 border border-neutral-300 bg-white px-4 text-sm font-semibold outline-none focus:border-primary"
            >
              <option value="nombre">
                Nombre: A-Z
              </option>

              <option value="-nombre">
                Nombre: Z-A
              </option>

              <option value="precio_base">
                Menor precio
              </option>

              <option value="-precio_base">
                Mayor precio
              </option>

              <option value="tiempo_estimado_minutos">
                Menor duración
              </option>

              <option value="-tiempo_estimado_minutos">
                Mayor duración
              </option>

              <option value="-fecha_creacion">
                Más recientes
              </option>
            </select>
          </div>
        </section>

        {/* Tabla */}
        <section className="overflow-hidden border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-neutral-900">
                Servicios registrados
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                {count} registro{count === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Servicio
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Precio base
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Tiempo estimado
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center"
                    >
                      <div className="flex items-center justify-center gap-3 text-sm font-semibold text-neutral-500">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        Cargando servicios...
                      </div>
                    </td>
                  </tr>
                ) : servicios.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center"
                    >
                      <Wrench className="mx-auto mb-3 size-10 text-neutral-300" />

                      <p className="text-sm font-bold text-neutral-600">
                        No se encontraron servicios.
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        Registra un servicio o modifica los
                        filtros.
                      </p>
                    </td>
                  </tr>
                ) : (
                  servicios.map((servicio) => (
                    <tr
                      key={servicio.id}
                      className="border-b border-neutral-100 transition-colors last:border-b-0 hover:bg-neutral-50"
                    >
                      <td className="px-5 py-4">
                        <div className="max-w-md">
                          <p className="text-sm font-black text-neutral-900">
                            {servicio.nombre}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                            {servicio.descripcion ||
                              'Sin descripción'}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-black text-neutral-900">
                          {formatCurrency(
                            servicio.precio_base,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                          <Clock3 className="size-4 text-primary" />

                          {formatDuration(
                            servicio.tiempo_estimado_minutos,
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            void handleToggleEstado(
                              servicio,
                            )
                          }
                          className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            servicio.estado
                              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {servicio.estado ? (
                            <Eye className="size-3.5" />
                          ) : (
                            <EyeOff className="size-3.5" />
                          )}

                          {servicio.estado
                            ? 'Activo'
                            : 'Inactivo'}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar servicio"
                            onClick={() =>
                              handleOpenEditModal(
                                servicio,
                              )
                            }
                            className="flex size-9 items-center justify-center border border-neutral-200 text-neutral-600 transition-colors hover:border-primary hover:bg-red-50 hover:text-primary"
                          >
                            <Edit className="size-4" />
                          </button>

                          <button
                            type="button"
                            title="Eliminar servicio"
                            onClick={() =>
                              handleOpenDeleteModal(
                                servicio,
                              )
                            }
                            className="flex size-9 items-center justify-center border border-neutral-200 text-neutral-600 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-200 px-5 py-4 sm:flex-row">
            <p className="text-xs font-semibold text-neutral-500">
              Página {currentPage} de {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() =>
                  handlePageChange(currentPage - 1)
                }
                className="h-9 border border-neutral-300 px-4 text-xs font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={
                  currentPage >= totalPages ||
                  isLoading
                }
                onClick={() =>
                  handlePageChange(currentPage + 1)
                }
                className="h-9 border border-neutral-300 px-4 text-xs font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal para crear o editar */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Taller
                </p>

                <h2 className="mt-1 text-xl font-black uppercase text-neutral-900">
                  {selectedServicio
                    ? 'Editar servicio'
                    : 'Nuevo servicio'}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseFormModal}
                disabled={isSaving}
                className="flex size-9 items-center justify-center border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-900 disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-xs font-black uppercase tracking-wide text-neutral-700"
                >
                  Nombre del servicio
                  <span className="ml-1 text-primary">
                    *
                  </span>
                </label>

                <input
                  id="nombre"
                  type="text"
                  maxLength={150}
                  value={formData.nombre}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      nombre: event.target.value,
                    }))
                  }
                  placeholder="Ej. Mantenimiento preventivo"
                  className={`h-11 w-full border bg-white px-4 text-sm outline-none transition-colors ${
                    formErrors.nombre
                      ? 'border-red-500'
                      : 'border-neutral-300 focus:border-primary'
                  }`}
                />

                {formErrors.nombre && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {formErrors.nombre}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="descripcion"
                  className="mb-2 block text-xs font-black uppercase tracking-wide text-neutral-700"
                >
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  rows={4}
                  value={formData.descripcion}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      descripcion:
                        event.target.value,
                    }))
                  }
                  placeholder="Describe las actividades incluidas en el servicio..."
                  className={`w-full resize-none border bg-white px-4 py-3 text-sm outline-none transition-colors ${
                    formErrors.descripcion
                      ? 'border-red-500'
                      : 'border-neutral-300 focus:border-primary'
                  }`}
                />

                {formErrors.descripcion && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    {formErrors.descripcion}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="precio_base"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-neutral-700"
                  >
                    Precio base
                    <span className="ml-1 text-primary">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                    <input
                      id="precio_base"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio_base}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          precio_base:
                            event.target.value,
                        }))
                      }
                      placeholder="0.00"
                      className={`h-11 w-full border bg-white pl-10 pr-4 text-sm outline-none transition-colors ${
                        formErrors.precio_base
                          ? 'border-red-500'
                          : 'border-neutral-300 focus:border-primary'
                      }`}
                    />
                  </div>

                  {formErrors.precio_base && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">
                      {formErrors.precio_base}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="tiempo_estimado"
                    className="mb-2 block text-xs font-black uppercase tracking-wide text-neutral-700"
                  >
                    Tiempo estimado
                    <span className="ml-1 text-primary">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Clock3 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                    <input
                      id="tiempo_estimado"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formData.tiempo_estimado_minutos
                      }
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          tiempo_estimado_minutos:
                            event.target.value,
                        }))
                      }
                      placeholder="Minutos"
                      className={`h-11 w-full border bg-white pl-10 pr-16 text-sm outline-none transition-colors ${
                        formErrors.tiempo_estimado_minutos
                          ? 'border-red-500'
                          : 'border-neutral-300 focus:border-primary'
                      }`}
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                      min
                    </span>
                  </div>

                  {formErrors.tiempo_estimado_minutos && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">
                      {
                        formErrors.tiempo_estimado_minutos
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-neutral-900">
                      Servicio activo
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Los servicios activos podrán ser
                      seleccionados en mantenimientos.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={formData.estado}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        estado: event.target.checked,
                      }))
                    }
                    className="size-5 accent-primary"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  disabled={isSaving}
                  className="h-11 border border-neutral-300 px-5 text-xs font-black uppercase tracking-widest text-neutral-700 transition-colors hover:border-neutral-500 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 bg-primary px-5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Guardando...
                    </>
                  ) : selectedServicio ? (
                    'Guardar cambios'
                  ) : (
                    'Crear servicio'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para eliminar */}
      {isDeleteModalOpen && selectedServicio && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-5 flex size-12 items-center justify-center bg-red-50">
                <Trash2 className="size-6 text-red-600" />
              </div>

              <h2 className="text-xl font-black uppercase text-neutral-900">
                Eliminar servicio
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                ¿Está seguro de eliminar el servicio{' '}
                <strong className="text-neutral-900">
                  {selectedServicio.nombre}
                </strong>
                ?
              </p>

              <p className="mt-2 text-xs font-semibold text-red-600">
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 bg-neutral-50 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={isSaving}
                className="h-11 border border-neutral-300 bg-white px-5 text-xs font-black uppercase tracking-widest text-neutral-700 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isSaving}
                className="inline-flex h-11 items-center justify-center gap-2 bg-red-600 px-5 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}