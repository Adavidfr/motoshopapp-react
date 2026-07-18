import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';

import { useRepuestoMantenimientoStore } from '../../store/repuesto-mantenimiento.store';
import { useMantenimientoStore } from '../../store/mantenimiento.store';
import { useRepuestoStore } from '../../store/repuesto.store';

import type { RepuestoMantenimiento } from '../../../domain/entities/repuesto-mantenimiento.entity';

interface FormState {
  mantenimiento: string;
  repuesto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

const initialForm: FormState = {
  mantenimiento: '',
  repuesto: '',
  cantidad: 1,
  precioUnitario: 0,
  subtotal: 0,
};

export default function RepuestosMantenimientoAdminPage() {
  const {
    repuestosMantenimiento,
    stats,
    count,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchRepuestosMantenimiento,
    fetchStats,
    createRepuestoMantenimiento,
    updateRepuestoMantenimiento,
    deleteRepuestoMantenimiento,
    clearMessages,
  } = useRepuestoMantenimientoStore();

  const { mantenimientos, fetchMantenimientos } = useMantenimientoStore();
  const { repuestos, fetchRepuestos } = useRepuestoStore();

  const [search, setSearch] = useState('');
  const [selectedMantenimiento, setSelectedMantenimiento] = useState('');
  const [selectedRepuesto, setSelectedRepuesto] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RepuestoMantenimiento | null>(null);
  const [itemToDelete, setItemToDelete] = useState<RepuestoMantenimiento | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [formError, setFormError] = useState<string | null>(null);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const selectedRepuestoObject = useMemo(
    () => repuestos.find((item) => item.idRepuesto === Number(form.repuesto)),
    [form.repuesto, repuestos],
  );

  useEffect(() => {
    void fetchStats();
    void fetchMantenimientos();
    void fetchRepuestos();
  }, [fetchStats, fetchMantenimientos, fetchRepuestos]);

  useEffect(() => {
    void fetchRepuestosMantenimiento({
      page,
      pageSize,
      search: search.trim() || undefined,
      mantenimiento: selectedMantenimiento
        ? Number(selectedMantenimiento)
        : undefined,
      repuesto: selectedRepuesto ? Number(selectedRepuesto) : undefined,
    });
  }, [
    page,
    search,
    selectedMantenimiento,
    selectedRepuesto,
    fetchRepuestosMantenimiento,
  ]);

  useEffect(() => {
    if (!selectedRepuestoObject) {
      return;
    }

    const precioUnitario = Number(selectedRepuestoObject.costo ?? 0);

    setForm((current) => ({
      ...current,
      precioUnitario,
      subtotal: Number((precioUnitario * current.cantidad).toFixed(2)),
    }));
  }, [selectedRepuestoObject]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      subtotal: Number((current.cantidad * current.precioUnitario).toFixed(2)),
    }));
  }, [form.cantidad, form.precioUnitario]);

  const resetForm = () => {
    setForm(initialForm);
    setFormError(null);
  };

  const openCreateModal = () => {
    clearMessages();
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: RepuestoMantenimiento) => {
    clearMessages();
    setEditingItem(item);
    setForm({
      mantenimiento: String(item.mantenimiento),
      repuesto: String(item.repuesto),
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForm();
    clearMessages();
  };

  const openDeleteModal = (item: RepuestoMantenimiento) => {
    clearMessages();
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    clearMessages();
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCantidadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const cantidad = Number(event.target.value);

    setForm((current) => ({
      ...current,
      cantidad: Number.isNaN(cantidad) ? 0 : cantidad,
    }));
  };

  const validateForm = (): string | null => {
    if (!form.mantenimiento) return 'Debe seleccionar un mantenimiento.';
    if (!form.repuesto) return 'Debe seleccionar un repuesto.';

    if (!Number.isInteger(form.cantidad) || form.cantidad <= 0) {
      return 'La cantidad debe ser un número entero mayor que cero.';
    }

    if (form.precioUnitario <= 0) {
      return 'El precio unitario debe ser mayor que cero.';
    }

    if (form.subtotal <= 0) {
      return 'El subtotal debe ser mayor que cero.';
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    setFormError(null);

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const dto = {
      mantenimiento: Number(form.mantenimiento),
      repuesto: Number(form.repuesto),
      cantidad: form.cantidad,
      precioUnitario: form.precioUnitario,
      subtotal: form.subtotal,
    };

    const success = editingItem
      ? await updateRepuestoMantenimiento(
          editingItem.idRepuestoMantenimiento,
          dto,
        )
      : await createRepuestoMantenimiento(dto);

    if (success) {
      closeModal();
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const success = await deleteRepuestoMantenimiento(
      itemToDelete.idRepuestoMantenimiento,
    );

    if (success) {
      closeDeleteModal();
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedMantenimiento('');
    setSelectedRepuesto('');
    setPage(1);
  };

  const getMantenimientoLabel = (id: number): string => {
    const mantenimiento = mantenimientos.find(
      (item) => item.idMantenimiento === id,
    );

    return mantenimiento
      ? `Mantenimiento #${mantenimiento.idMantenimiento}`
      : `Mantenimiento #${id}`;
  };

  const getRepuestoLabel = (id: number): string => {
    const repuesto = repuestos.find((item) => item.idRepuesto === id);
    return repuesto?.nombre ?? `Repuesto #${id}`;
  };

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);

  const displayedRange = useMemo(() => {
    if (count === 0) {
      return '0 resultados';
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, count);

    return `${start}-${end} de ${count}`;
  }, [count, page, pageSize]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            Taller
          </p>

          <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            Repuestos de mantenimiento
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            Administra los repuestos utilizados en cada mantenimiento.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(255,26,26,0.25)] transition-all hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Agregar repuesto
        </button>
      </section>

      {successMessage && !showModal && !showDeleteModal && (
        <div className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-3 text-center text-xs font-semibold text-green-400">
          {successMessage}
        </div>
      )}

      {error && !showModal && !showDeleteModal && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Registros totales"
          value={stats?.total ?? count}
          icon={<ClipboardList className="size-5" />}
        />

        <StatCard
          title="Cantidad utilizada"
          value={
            stats?.detail.reduce(
              (total, item) => total + item.cantidad,
              0,
            ) ?? 0
          }
          icon={<Package className="size-5" />}
        />

        <StatCard
          title="Valor acumulado"
          value={formatCurrency(
            stats?.detail.reduce(
              (total, item) => total + item.subtotal,
              0,
            ) ?? 0,
          )}
          icon={<Wrench className="size-5" />}
        />

        <StatCard
          title="Página actual"
          value={`${page} / ${totalPages}`}
          icon={<ClipboardList className="size-5" />}
        />
      </section>

      <section className="rounded-[2rem] border border-neutral-900 bg-[#0c0c0e] p-4 shadow-2xl md:p-5">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />

            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre del repuesto..."
              className="w-full rounded-full border border-neutral-800 bg-[#141417] py-3 pl-11 pr-11 text-sm font-semibold text-white placeholder:text-neutral-600 focus:border-primary/80 focus:outline-none focus:ring-4 focus:ring-primary/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <select
            id="filter-mantenimiento"
            value={selectedMantenimiento}
            onChange={(event) => {
              setSelectedMantenimiento(event.target.value);
              setPage(1);
            }}
            className="rounded-full border border-neutral-800 bg-[#141417] px-5 py-3 text-sm font-semibold text-white outline-none focus:border-primary"
          >
            <option value="">Todos los mantenimientos</option>

            {mantenimientos.map((mantenimiento) => (
              <option
                key={mantenimiento.idMantenimiento}
                value={mantenimiento.idMantenimiento}
              >
                Mantenimiento #{mantenimiento.idMantenimiento}
              </option>
            ))}
          </select>

          <select
            id="filter-repuesto"
            value={selectedRepuesto}
            onChange={(event) => {
              setSelectedRepuesto(event.target.value);
              setPage(1);
            }}
            className="rounded-full border border-neutral-800 bg-[#141417] px-5 py-3 text-sm font-semibold text-white outline-none focus:border-primary"
          >
            <option value="">Todos los repuestos</option>

            {repuestos.map((repuesto) => (
              <option
                key={repuesto.idRepuesto}
                value={repuesto.idRepuesto}
              >
                {repuesto.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            disabled={
              !search &&
              !selectedMantenimiento &&
              !selectedRepuesto
            }
            className="rounded-full bg-neutral-800 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-neutral-900 bg-[#0c0c0e] shadow-2xl">
        {isLoading && repuestosMantenimiento.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : repuestosMantenimiento.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
            <Wrench className="mb-4 size-12 text-neutral-700" />

            <h2 className="text-lg font-black uppercase text-white">
              No existen registros
            </h2>

            <p className="mt-2 max-w-md text-sm text-neutral-500">
              Modifica los filtros o agrega un repuesto a un mantenimiento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-950 text-xs font-black uppercase tracking-wider text-neutral-400">
                  <th className="px-6 py-4">Registro</th>
                  <th className="px-6 py-4">Mantenimiento</th>
                  <th className="px-6 py-4">Repuesto</th>
                  <th className="px-6 py-4 text-right">Cantidad</th>
                  <th className="px-6 py-4 text-right">
                    Precio unitario
                  </th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-950 text-sm">
                {repuestosMantenimiento.map((item) => (
                  <tr
                    key={item.idRepuestoMantenimiento}
                    className="transition-colors hover:bg-neutral-900/20"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                          <Wrench className="size-4" />
                        </div>

                        <p className="font-bold text-white">
                          #{item.idRepuestoMantenimiento}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-neutral-400">
                      {getMantenimientoLabel(item.mantenimiento)}
                    </td>

                    <td className="px-6 py-4 font-bold text-white">
                      {getRepuestoLabel(item.repuesto)}
                    </td>

                    <td className="px-6 py-4 text-right text-neutral-300">
                      {item.cantidad}
                    </td>

                    <td className="px-6 py-4 text-right text-neutral-300">
                      {formatCurrency(item.precioUnitario)}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-white">
                      {formatCurrency(item.subtotal)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Editar"
                          className="rounded-full bg-neutral-900 p-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white"
                        >
                          <Pencil className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(item)}
                          title="Eliminar"
                          className="rounded-full bg-destructive/10 p-2 text-destructive transition-all hover:bg-destructive/20"
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
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
              disabled={page <= 1 || isLoading}
              className="flex size-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="min-w-24 text-center text-xs font-bold text-neutral-400">
              Página {page} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1),
                )
              }
              disabled={page >= totalPages || isLoading}
              className="flex size-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border border-neutral-900 bg-[#0c0c0e] p-7 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
                  Taller
                </p>

                <h2 className="mt-2 text-2xl font-black uppercase text-white">
                  {editingItem
                    ? 'Editar repuesto'
                    : 'Agregar repuesto'}
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Selecciona el mantenimiento, el repuesto y la cantidad.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="rounded-full bg-neutral-900 p-2 text-neutral-500 transition-colors hover:text-white disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {(formError || error) && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-xs font-semibold text-destructive">
                  {formError ?? error}
                </div>
              )}

              <FormField label="Mantenimiento" required>
                <select
                  id="mantenimiento"
                  name="mantenimiento"
                  value={form.mantenimiento}
                  onChange={handleSelectChange}
                  disabled={isSaving}
                  className={inputClass()}
                >
                  <option value="">
                    Seleccione un mantenimiento
                  </option>

                  {mantenimientos.map((mantenimiento) => (
                    <option
                      key={mantenimiento.idMantenimiento}
                      value={mantenimiento.idMantenimiento}
                    >
                      Mantenimiento #
                      {mantenimiento.idMantenimiento}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Repuesto" required>
                <select
                  id="repuesto"
                  name="repuesto"
                  value={form.repuesto}
                  onChange={handleSelectChange}
                  disabled={isSaving}
                  className={inputClass()}
                >
                  <option value="">
                    Seleccione un repuesto
                  </option>

                  {repuestos.map((repuesto) => (
                    <option
                      key={repuesto.idRepuesto}
                      value={repuesto.idRepuesto}
                    >
                      {repuesto.nombre}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <FormField label="Cantidad" required>
                  <input
                    id="cantidad"
                    type="number"
                    min="1"
                    step="1"
                    value={form.cantidad}
                    onChange={handleCantidadChange}
                    disabled={isSaving}
                    className={inputClass()}
                  />
                </FormField>

                <FormField label="Precio unitario">
                  <input
                    id="precioUnitario"
                    type="text"
                    value={formatCurrency(
                      form.precioUnitario,
                    )}
                    readOnly
                    className={readOnlyInputClass()}
                  />
                </FormField>

                <FormField label="Subtotal">
                  <input
                    id="subtotal"
                    type="text"
                    value={formatCurrency(form.subtotal)}
                    readOnly
                    className={readOnlyInputClass()}
                  />
                </FormField>
              </div>

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
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
                    : editingItem
                      ? 'Actualizar'
                      : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2.5rem] border border-neutral-900 bg-[#0c0c0e] p-8 shadow-2xl">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
              <Trash2 className="size-6" />
            </div>

            <h2 className="text-center text-xl font-black uppercase text-white">
              Eliminar repuesto
            </h2>

            {error && (
              <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-xs font-semibold text-destructive">
                {error}
              </div>
            )}

            <p className="mt-4 text-center text-sm leading-relaxed text-neutral-400">
              Se eliminará{' '}
              <span className="font-bold text-white">
                {getRepuestoLabel(itemToDelete.repuesto)}
              </span>{' '}
              de{' '}
              <span className="font-bold text-white">
                {getMantenimientoLabel(
                  itemToDelete.mantenimiento,
                )}
              </span>
              .
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isSaving}
                className="w-full rounded-full border border-neutral-800 py-3 text-xs font-black uppercase text-neutral-400 transition-colors hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
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

function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
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
  children: React.ReactNode;
}

function FormField({
  label,
  required = false,
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
    </div>
  );
}

function inputClass(): string {
  return [
    'w-full rounded-full border border-neutral-800 bg-[#141417] px-5 py-3',
    'text-sm font-semibold text-white outline-none transition',
    'focus:border-primary/80 focus:ring-4 focus:ring-primary/10',
    'disabled:cursor-not-allowed disabled:bg-neutral-900 disabled:text-neutral-600',
  ].join(' ');
}

function readOnlyInputClass(): string {
  return [
    'w-full rounded-full border border-neutral-800 bg-neutral-900 px-5 py-3',
    'text-sm font-bold text-neutral-300 outline-none',
  ].join(' ');
}
