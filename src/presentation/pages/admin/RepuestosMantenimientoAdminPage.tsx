import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import {
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

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Wrench className="h-7 w-7 text-blue-600" />
            Repuestos de mantenimiento
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los repuestos utilizados en cada mantenimiento.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Agregar repuesto
        </button>
      </section>

      {successMessage && !showModal && !showDeleteModal && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && !showModal && !showDeleteModal && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Registros totales</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats?.total ?? count}
          </p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Cantidad total utilizada</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats?.detail.reduce((total, item) => total + item.cantidad, 0) ?? 0}
          </p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Valor acumulado</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(
              stats?.detail.reduce((total, item) => total + item.subtotal, 0) ?? 0,
            )}
          </p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Página actual</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {page} / {totalPages}
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label htmlFor="search" className="mb-1.5 block text-sm font-medium text-gray-700">
              Buscar repuesto
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nombre del repuesto..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="filter-mantenimiento" className="mb-1.5 block text-sm font-medium text-gray-700">
              Mantenimiento
            </label>
            <select
              id="filter-mantenimiento"
              value={selectedMantenimiento}
              onChange={(event) => {
                setSelectedMantenimiento(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          </div>

          <div>
            <label htmlFor="filter-repuesto" className="mb-1.5 block text-sm font-medium text-gray-700">
              Repuesto
            </label>
            <select
              id="filter-repuesto"
              value={selectedRepuesto}
              onChange={(event) => {
                setSelectedRepuesto(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todos los repuestos</option>
              {repuestos.map((repuesto) => (
                <option key={repuesto.idRepuesto} value={repuesto.idRepuesto}>
                  {repuesto.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!search && !selectedMantenimiento && !selectedRepuesto}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Mantenimiento', 'Repuesto', 'Cantidad', 'Precio unitario', 'Subtotal', 'Acciones'].map((label) => (
                  <th
                    key={label}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    Cargando repuestos de mantenimiento...
                  </td>
                </tr>
              ) : repuestosMantenimiento.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No existen registros.
                  </td>
                </tr>
              ) : (
                repuestosMantenimiento.map((item) => (
                  <tr key={item.idRepuestoMantenimiento} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      #{item.idRepuestoMantenimiento}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {getMantenimientoLabel(item.mantenimiento)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getRepuestoLabel(item.repuesto)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {item.cantidad}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {formatCurrency(item.precioUnitario)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Editar"
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(item)}
                          title="Eliminar"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Mostrando {repuestosMantenimiento.length} de {count} registros
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || isLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || isLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingItem
                    ? 'Editar repuesto de mantenimiento'
                    : 'Agregar repuesto al mantenimiento'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Selecciona el mantenimiento, el repuesto y la cantidad.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-5">
                {(formError || error) && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError ?? error}
                  </div>
                )}

                <div>
                  <label htmlFor="mantenimiento" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Mantenimiento
                  </label>
                  <select
                    id="mantenimiento"
                    name="mantenimiento"
                    value={form.mantenimiento}
                    onChange={handleSelectChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  >
                    <option value="">Seleccione un mantenimiento</option>
                    {mantenimientos.map((mantenimiento) => (
                      <option
                        key={mantenimiento.idMantenimiento}
                        value={mantenimiento.idMantenimiento}
                      >
                        Mantenimiento #{mantenimiento.idMantenimiento}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="repuesto" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Repuesto
                  </label>
                  <select
                    id="repuesto"
                    name="repuesto"
                    value={form.repuesto}
                    onChange={handleSelectChange}
                    disabled={isSaving}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  >
                    <option value="">Seleccione un repuesto</option>
                    {repuestos.map((repuesto) => (
                      <option key={repuesto.idRepuesto} value={repuesto.idRepuesto}>
                        {repuesto.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="cantidad" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Cantidad
                    </label>
                    <input
                      id="cantidad"
                      type="number"
                      min="1"
                      step="1"
                      value={form.cantidad}
                      onChange={handleCantidadChange}
                      disabled={isSaving}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label htmlFor="precioUnitario" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Precio unitario
                    </label>
                    <input
                      id="precioUnitario"
                      type="text"
                      value={formatCurrency(form.precioUnitario)}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label htmlFor="subtotal" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Subtotal
                    </label>
                    <input
                      id="subtotal"
                      type="text"
                      value={formatCurrency(form.subtotal)}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Eliminar repuesto</h2>
            </div>
            <div className="px-6 py-5">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <p className="text-sm text-gray-600">
                ¿Estás seguro de eliminar{' '}
                <span className="font-semibold text-gray-900">
                  {getRepuestoLabel(itemToDelete.repuesto)}
                </span>{' '}
                de {getMantenimientoLabel(itemToDelete.mantenimiento)}?
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSaving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
