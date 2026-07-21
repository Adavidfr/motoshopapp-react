import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import { useProveedorStore } from '../../store/proveedor.store';
import { useAuthStore } from '../../store/auth.store';

import type { Proveedor } from '../../../domain/entities/proveedor.entity';
import type { ProveedorDto } from '../../../application/dtos/proveedor.dto';

interface ProveedorFormState {
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
  estado: boolean;
}

const initialForm: ProveedorFormState = {
  nombre: '',
  contacto: '',
  telefono: '',
  correo: '',
  direccion: '',
  estado: true,
};

export default function ProveedoresAdminPage() {
  const { user } = useAuthStore();

  const {
    proveedores,
    stats,
    count,
    filters,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchProveedores,
    fetchStats,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    clearMessages,
  } = useProveedorStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] =
    useState<Proveedor | null>(null);
  const [deletingProveedor, setDeletingProveedor] =
    useState<Proveedor | null>(null);

  const [form, setForm] =
    useState<ProveedorFormState>(initialForm);

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ProveedorFormState, string>>
  >({});

  const [searchText, setSearchText] = useState(
    filters.search ?? '',
  );

  const isAdmin = user?.isStaff === true;

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  useEffect(() => {
    fetchProveedores();
    fetchStats();
  }, [fetchProveedores, fetchStats]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearMessages();
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage, clearMessages]);

  const displayedRange = useMemo(() => {
    if (count === 0) {
      return '0 resultados';
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, count);

    return `${start}-${end} de ${count}`;
  }, [count, page, pageSize]);

  const resetForm = () => {
    setForm(initialForm);
    setFormErrors({});
    setEditingProveedor(null);
  };

  const handleOpenCreate = () => {
    clearMessages();
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (proveedor: Proveedor) => {
    clearMessages();

    setEditingProveedor(proveedor);

    setForm({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto ?? '',
      telefono: proveedor.telefono ?? '',
      correo: proveedor.correo ?? '',
      direccion: proveedor.direccion ?? '',
      estado: proveedor.estado,
    });

    setFormErrors({});
    setModalOpen(true);
  };

  const handleCloseForm = () => {
    if (isSaving) {
      return;
    }

    setModalOpen(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    const errors: Partial<
      Record<keyof ProveedorFormState, string>
    > = {};

    const nombre = form.nombre.trim();
    const contacto = form.contacto.trim();
    const telefono = form.telefono.trim();
    const correo = form.correo.trim();

    if (!nombre) {
      errors.nombre = 'El nombre es obligatorio.';
    } else if (nombre.length > 120) {
      errors.nombre =
        'El nombre no puede superar los 120 caracteres.';
    }

    if (contacto.length > 100) {
      errors.contacto =
        'El contacto no puede superar los 100 caracteres.';
    }

    if (telefono.length > 20) {
      errors.telefono =
        'El teléfono no puede superar los 20 caracteres.';
    } else if (
      telefono &&
      !/^[0-9+\-\s()]+$/.test(telefono)
    ) {
      errors.telefono =
        'El teléfono contiene caracteres no permitidos.';
    }

    if (
      correo &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ) {
      errors.correo = 'Ingrese un correo válido.';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const buildDto = (): ProveedorDto => ({
    nombre: form.nombre.trim(),
    contacto: form.contacto.trim() || null,
    telefono: form.telefono.trim() || null,
    correo: form.correo.trim() || null,
    direccion: form.direccion.trim() || null,
    estado: form.estado,
  });

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const dto = buildDto();

      if (editingProveedor) {
        await updateProveedor(editingProveedor.id, dto);
      } else {
        await createProveedor(dto);
      }

      setModalOpen(false);
      resetForm();
    } catch {
      // El error se muestra desde el store.
    }
  };

  const handleToggleStatus = async (
    proveedor: Proveedor,
  ) => {
    if (!isAdmin) {
      return;
    }

    try {
      await updateProveedor(proveedor.id, {
        estado: !proveedor.estado,
      });
    } catch {
      // El error se muestra desde el store.
    }
  };

  const handleOpenDelete = (proveedor: Proveedor) => {
    clearMessages();
    setDeletingProveedor(proveedor);
    setDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    if (isSaving) {
      return;
    }

    setDeleteModalOpen(false);
    setDeletingProveedor(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProveedor) {
      return;
    }

    try {
      await deleteProveedor(deletingProveedor.id);
      setDeleteModalOpen(false);
      setDeletingProveedor(null);
    } catch {
      // El error se muestra desde el store.
    }
  };

  const handleSearch = () => {
    fetchProveedores({
      search: searchText.trim() || undefined,
      page: 1,
    });
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchText('');

    fetchProveedores({
      search: undefined,
      page: 1,
    });
  };

  const handleEstadoFilter = (
    value: 'all' | 'active' | 'inactive',
  ) => {
    const estado =
      value === 'all'
        ? undefined
        : value === 'active';

    fetchProveedores({
      estado,
      page: 1,
    });
  };

  const handleOrdering = (
    value: 'nombre' | '-nombre' | 'estado' | '-estado',
  ) => {
    fetchProveedores({
      ordering: value,
      page: 1,
    });
  };

  const handlePreviousPage = () => {
    if (page <= 1 || isLoading) {
      return;
    }

    fetchProveedores({
      page: page - 1,
    });
  };

  const handleNextPage = () => {
    if (page >= totalPages || isLoading) {
      return;
    }

    fetchProveedores({
      page: page + 1,
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            Abastecimiento
          </p>

          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
            Administrar proveedores
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona los proveedores utilizados para las compras
            de motos y repuestos.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-[0_4px_20px_rgba(255,26,26,0.25)] transition-all hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Nuevo proveedor
          </button>
        )}
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total"
          value={stats?.total ?? count}
          icon={<Users className="size-5" />}
        />

        <StatCard
          title="Activos"
          value={stats?.activos ?? 0}
          icon={<ToggleRight className="size-5" />}
        />

        <StatCard
          title="Inactivos"
          value={stats?.inactivos ?? 0}
          icon={<ToggleLeft className="size-5" />}
        />
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-4 shadow-2xl md:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />

            <input
              type="search"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar por nombre, contacto, correo o teléfono..."
              className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-11 text-sm font-semibold text-foreground placeholder:text-neutral-600 focus:border-primary/80 focus:outline-none focus:ring-4 focus:ring-primary/10"
            />

            {searchText && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="rounded-full bg-muted px-5 py-3 text-xs font-black uppercase tracking-wider text-foreground transition-colors hover:bg-neutral-700"
          >
            Buscar
          </button>

          <select
            value={
              filters.estado === undefined
                ? 'all'
                : filters.estado
                  ? 'active'
                  : 'inactive'
            }
            onChange={(event) =>
              handleEstadoFilter(
                event.target.value as
                  | 'all'
                  | 'active'
                  | 'inactive',
              )
            }
            className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <select
            value={filters.ordering ?? 'nombre'}
            onChange={(event) =>
              handleOrdering(
                event.target.value as
                  | 'nombre'
                  | '-nombre'
                  | 'estado'
                  | '-estado',
              )
            }
            className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
          >
            <option value="nombre">Nombre A-Z</option>
            <option value="-nombre">Nombre Z-A</option>
            <option value="-estado">
              Activos primero
            </option>
            <option value="estado">
              Inactivos primero
            </option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
        {isLoading && proveedores.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : proveedores.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
            <Building2 className="mb-4 size-12 text-neutral-700" />

            <h2 className="text-lg font-black uppercase text-foreground">
              No se encontraron proveedores
            </h2>

            <p className="mt-2 max-w-md text-sm text-neutral-500">
              Modifica los filtros de búsqueda o registra un
              nuevo proveedor.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-950 text-xs font-black uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4 text-center">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-950 text-sm">
                {proveedores.map((proveedor) => (
                  <tr
                    key={proveedor.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                          <Building2 className="size-4" />
                        </div>

                        <div>
                          <p className="font-bold text-foreground">
                            {proveedor.nombre}
                          </p>

                          <p className="mt-1 text-xs text-neutral-600">
                            #{proveedor.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {proveedor.contacto || 'Sin contacto'}
                    </td>

                    <td className="px-6 py-4">
                      {proveedor.telefono ? (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-3.5 text-neutral-600" />
                          {proveedor.telefono}
                        </span>
                      ) : (
                        <span className="text-neutral-600">
                          Sin teléfono
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {proveedor.correo ? (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-3.5 text-neutral-600" />
                          {proveedor.correo}
                        </span>
                      ) : (
                        <span className="text-neutral-600">
                          Sin correo
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        disabled={!isAdmin || isSaving}
                        onClick={() =>
                          handleToggleStatus(proveedor)
                        }
                        className="disabled:cursor-default"
                        title={
                          isAdmin
                            ? 'Cambiar estado'
                            : 'Solo lectura'
                        }
                      >
                        {proveedor.estado ? (
                          <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase text-green-400">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold uppercase text-neutral-500">
                            Inactivo
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {isAdmin ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEdit(proveedor)
                            }
                            className="rounded-full bg-muted p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                            title="Editar proveedor"
                          >
                            <Edit className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDelete(proveedor)
                            }
                            className="rounded-full bg-destructive/10 p-2 text-destructive transition-all hover:bg-destructive/20"
                            title="Eliminar proveedor"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold uppercase text-neutral-600">
                          Solo lectura
                        </span>
                      )}
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
              disabled={page <= 1 || isLoading}
              onClick={handlePreviousPage}
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="min-w-24 text-center text-xs font-bold text-muted-foreground">
              Página {page} de {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={handleNextPage}
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border border-border bg-card p-7 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
                  Proveedores
                </p>

                <h2 className="mt-2 text-2xl font-black uppercase text-foreground">
                  {editingProveedor
                    ? 'Editar proveedor'
                    : 'Nuevo proveedor'}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="rounded-full bg-muted p-2 text-neutral-500 transition-colors hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <FormField
                label="Nombre"
                required
                error={formErrors.nombre}
              >
                <input
                  type="text"
                  maxLength={120}
                  value={form.nombre}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nombre: event.target.value,
                    }))
                  }
                  placeholder="Ej: Motor Place"
                  className={inputClass(Boolean(formErrors.nombre))}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField
                  label="Persona de contacto"
                  error={formErrors.contacto}
                >
                  <input
                    type="text"
                    maxLength={100}
                    value={form.contacto}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contacto: event.target.value,
                      }))
                    }
                    placeholder="Ej: Anahí Delgado"
                    className={inputClass(
                      Boolean(formErrors.contacto),
                    )}
                  />
                </FormField>

                <FormField
                  label="Teléfono"
                  error={formErrors.telefono}
                >
                  <input
                    type="tel"
                    maxLength={20}
                    value={form.telefono}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        telefono: event.target.value,
                      }))
                    }
                    placeholder="Ej: 0984045078"
                    className={inputClass(
                      Boolean(formErrors.telefono),
                    )}
                  />
                </FormField>
              </div>

              <FormField
                label="Correo electrónico"
                error={formErrors.correo}
              >
                <input
                  type="email"
                  value={form.correo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      correo: event.target.value,
                    }))
                  }
                  placeholder="proveedor@empresa.com"
                  className={inputClass(Boolean(formErrors.correo))}
                />
              </FormField>

              <FormField label="Dirección">
                <textarea
                  value={form.direccion}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      direccion: event.target.value,
                    }))
                  }
                  placeholder="Dirección del proveedor..."
                  className="h-28 w-full resize-none rounded-[1.5rem] border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground placeholder:text-neutral-600 focus:border-primary/80 focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </FormField>

              <div className="flex items-center justify-between rounded-[1.5rem] border border-border bg-background px-5 py-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-foreground">
                    Proveedor activo
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Permite utilizarlo en operaciones de compra.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      estado: !current.estado,
                    }))
                  }
                >
                  {form.estado ? (
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
                  onClick={handleCloseForm}
                  className="w-full rounded-full border border-border py-4 text-xs font-black uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-[0_4px_20px_rgba(255,26,26,0.25)] transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving && (
                    <Loader2 className="size-4 animate-spin" />
                  )}

                  {isSaving
                    ? 'Guardando...'
                    : editingProveedor
                      ? 'Actualizar'
                      : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && deletingProveedor && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
              <Trash2 className="size-6" />
            </div>

            <h2 className="text-center text-xl font-black uppercase text-foreground">
              Eliminar proveedor
            </h2>

            <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
              Se eliminará el proveedor{' '}
              <span className="font-bold text-foreground">
                {deletingProveedor.nombre}
              </span>
              . Esta acción no se puede deshacer.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCloseDelete}
                className="w-full rounded-full border border-border py-3 text-xs font-black uppercase text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmDelete}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-destructive py-3 text-xs font-black uppercase text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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
  value: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-neutral-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-foreground">
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
      <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
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
    'w-full rounded-full border bg-background px-5 py-3 text-sm font-semibold text-foreground',
    'placeholder:text-neutral-600 focus:outline-none focus:ring-4 focus:ring-primary/10',
    hasError
      ? 'border-destructive'
      : 'border-border focus:border-primary/80',
  ].join(' ');
}