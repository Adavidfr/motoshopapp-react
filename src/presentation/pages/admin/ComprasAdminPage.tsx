import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import type {
  Compra,
  CompraEstado,
} from '../../../domain/entities/compra.entity';

import type {
  CompraDto,
  CompraFilters,
} from '../../../application/dtos/compra.dto';

import {
  compraSchema,
} from '../../../application/dtos/compra.dto';

import {
  useCompraStore,
} from '../../store/compra.store';

import {
  useProveedorStore,
} from '../../store/proveedor.store';

import {
  useMotoStore,
} from '../../store/moto.store';

import {
  useRepuestoStore,
} from '../../store/repuesto.store';

type TipoProducto = 'moto' | 'repuesto';

interface CompraFormState {
  proveedor: string;
  tipoProducto: TipoProducto;
  moto: string;
  repuesto: string;
  cantidad: string;
  precioUnitario: string;
  subtotal: string;
  estado: CompraEstado;
}

interface FormErrors {
  proveedor?: string;
  moto?: string;
  repuesto?: string;
  cantidad?: string;
  precio_unitario?: string;
  subtotal?: string;
  estado?: string;
  general?: string;
}

const initialFormState: CompraFormState = {
  proveedor: '',
  tipoProducto: 'repuesto',
  moto: '',
  repuesto: '',
  cantidad: '1',
  precioUnitario: '',
  subtotal: '',
  estado: 'Pendiente',
};

const estadoOptions: CompraEstado[] = [
  'Pendiente',
  'Recibida',
  'Cancelada',
];

const formatCurrency = (
  value: string | number,
): string => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(numberValue);
};

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const calculateSubtotal = (
  cantidad: string,
  precioUnitario: string,
): string => {
  const cantidadNumber = Number(cantidad);
  const precioNumber = Number(precioUnitario);

  if (
    !Number.isFinite(cantidadNumber) ||
    !Number.isFinite(precioNumber) ||
    cantidadNumber <= 0 ||
    precioNumber <= 0
  ) {
    return '';
  }

  return (cantidadNumber * precioNumber).toFixed(2);
};

export default function ComprasAdminPage() {
  const {
    compras,
    stats,
    count,
    filters,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchCompras,
    fetchStats,
    createCompra,
    updateCompra,
    deleteCompra,
    clearMessages,
  } = useCompraStore();

  const {
    proveedores,
    fetchProveedores,
  } = useProveedorStore();

  const {
    motos,
    fetchMotos,
  } = useMotoStore();

  const {
    repuestos,
    fetchRepuestos,
  } = useRepuestoStore();

  const [form, setForm] =
    useState<CompraFormState>(initialFormState);

  const [formErrors, setFormErrors] =
    useState<FormErrors>({});

  const [search, setSearch] = useState(
    filters.search ?? '',
  );

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingCompra, setEditingCompra] =
    useState<Compra | null>(null);

  const [deletingCompra, setDeletingCompra] =
    useState<Compra | null>(null);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;

  const totalPages = Math.max(
    1,
    Math.ceil(count / pageSize),
  );

  const proveedoresMap = useMemo(
    () =>
      new Map(
        proveedores.map((proveedor) => [
          proveedor.id,
          proveedor.nombre,
        ]),
      ),
    [proveedores],
  );

  const motosMap = useMemo(
    () =>
      new Map(
        motos.map((moto) => [
          moto.idMoto,
          `${moto.marca} ${moto.modelo} (${moto.anio})`,
        ]),
      ),
    [motos],
  );

  const repuestosMap = useMemo(
    () =>
      new Map(
        repuestos.map((repuesto) => [
          repuesto.idRepuesto,
          `${repuesto.nombre} - ${repuesto.sku}`,
        ]),
      ),
    [repuestos],
  );

  const loadInitialData = useCallback(async () => {
    await Promise.all([
      fetchCompras(),
      fetchStats(),
      fetchProveedores({
        page: 1,
        pageSize: 1000,
        ordering: 'nombre',
      }),
      fetchMotos(),
      fetchRepuestos(),
    ]);
  }, [
    fetchCompras,
    fetchMotos,
    fetchProveedores,
    fetchRepuestos,
    fetchStats,
  ]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchCompras({
        search: search.trim() || undefined,
        page: 1,
      });
    }, 450);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fetchCompras, search]);

  useEffect(() => {
    if (!error && !successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      clearMessages();
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    clearMessages,
    error,
    successMessage,
  ]);

  const resetForm = () => {
    setForm(initialFormState);
    setFormErrors({});
    setEditingCompra(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditModal = (compra: Compra) => {
    const tipoProducto: TipoProducto =
      compra.moto !== null
        ? 'moto'
        : 'repuesto';

    setEditingCompra(compra);

    setForm({
      proveedor: String(compra.proveedor),
      tipoProducto,
      moto:
        compra.moto !== null
          ? String(compra.moto)
          : '',
      repuesto:
        compra.repuesto !== null
          ? String(compra.repuesto)
          : '',
      cantidad: String(compra.cantidad),
      precioUnitario: compra.precio_unitario,
      subtotal: compra.subtotal,
      estado: compra.estado,
    });

    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleTipoProductoChange = (
    tipoProducto: TipoProducto,
  ) => {
    setForm((current) => ({
      ...current,
      tipoProducto,
      moto: '',
      repuesto: '',
      precioUnitario: '',
      subtotal: '',
    }));

    setFormErrors({});
  };

  const handleMotoChange = (value: string) => {
    const selectedMoto = motos.find(
      (moto) => moto.idMoto === Number(value),
    );

    const precio = selectedMoto
      ? selectedMoto.precio.toFixed(2)
      : '';

    setForm((current) => ({
      ...current,
      moto: value,
      repuesto: '',
      precioUnitario: precio,
      subtotal: calculateSubtotal(
        current.cantidad,
        precio,
      ),
    }));

    setFormErrors((current) => ({
      ...current,
      moto: undefined,
      repuesto: undefined,
      precio_unitario: undefined,
      subtotal: undefined,
    }));
  };

  const handleRepuestoChange = (
    value: string,
  ) => {
    const selectedRepuesto = repuestos.find(
      (repuesto) =>
        repuesto.idRepuesto === Number(value),
    );

    const precio = selectedRepuesto
      ? selectedRepuesto.costo.toFixed(2)
      : '';

    setForm((current) => ({
      ...current,
      moto: '',
      repuesto: value,
      precioUnitario: precio,
      subtotal: calculateSubtotal(
        current.cantidad,
        precio,
      ),
    }));

    setFormErrors((current) => ({
      ...current,
      moto: undefined,
      repuesto: undefined,
      precio_unitario: undefined,
      subtotal: undefined,
    }));
  };

  const handleCantidadChange = (
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      cantidad: value,
      subtotal: calculateSubtotal(
        value,
        current.precioUnitario,
      ),
    }));

    setFormErrors((current) => ({
      ...current,
      cantidad: undefined,
      subtotal: undefined,
    }));
  };

  const handlePrecioChange = (
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      precioUnitario: value,
      subtotal: calculateSubtotal(
        current.cantidad,
        value,
      ),
    }));

    setFormErrors((current) => ({
      ...current,
      precio_unitario: undefined,
      subtotal: undefined,
    }));
  };

  const buildDto = (): CompraDto => ({
    proveedor: Number(form.proveedor),
    moto:
      form.tipoProducto === 'moto' &&
      form.moto
        ? Number(form.moto)
        : null,
    repuesto:
      form.tipoProducto === 'repuesto' &&
      form.repuesto
        ? Number(form.repuesto)
        : null,
    cantidad: Number(form.cantidad),
    precio_unitario:
      form.precioUnitario.trim(),
    subtotal: form.subtotal.trim(),
    estado: form.estado,
  });

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const dto = buildDto();
    const validation =
      compraSchema.safeParse(dto);

    if (!validation.success) {
      const errors: FormErrors = {};

      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (
          typeof field === 'string' &&
          !errors[field as keyof FormErrors]
        ) {
          errors[field as keyof FormErrors] =
            issue.message;
        }
      });

      setFormErrors(errors);
      return;
    }

    let completed = false;

    if (editingCompra) {
      completed = await updateCompra(
        editingCompra.id_compra,
        validation.data,
      );
    } else {
      completed = await createCompra(
        validation.data,
      );
    }

    if (completed) {
      setIsFormOpen(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!deletingCompra) {
      return;
    }

    const completed = await deleteCompra(
      deletingCompra.id_compra,
    );

    if (completed) {
      setDeletingCompra(null);
    }
  };

  const handleFilterChange = (
    newFilters: Partial<CompraFilters>,
  ) => {
    void fetchCompras({
      ...newFilters,
      page: 1,
    });
  };

  const handlePageChange = (
    newPage: number,
  ) => {
    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {
      return;
    }

    void fetchCompras({
      page: newPage,
    });
  };

  const getProductoDescription = (
    compra: Compra,
  ): string => {
    if (compra.moto !== null) {
      return (
        motosMap.get(compra.moto) ??
        `Moto #${compra.moto}`
      );
    }

    if (compra.repuesto !== null) {
      return (
        repuestosMap.get(compra.repuesto) ??
        `Repuesto #${compra.repuesto}`
      );
    }

    return 'Sin producto';
  };

  const getEstadoClasses = (
    estado: CompraEstado,
  ): string => {
    switch (estado) {
      case 'Recibida':
        return (
          'bg-green-100 text-green-700 ' +
          'border-green-200'
        );

      case 'Cancelada':
        return (
          'bg-red-100 text-red-700 ' +
          'border-red-200'
        );

      default:
        return (
          'bg-amber-100 text-amber-700 ' +
          'border-amber-200'
        );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Administración de compras
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestiona las compras de motos y
            repuestos realizadas a proveedores.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Nueva compra
        </button>
      </header>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total de compras
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {stats?.total ?? 0}
          </p>
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">
            Pendientes
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-800">
            {stats?.pendientes ?? 0}
          </p>
        </article>

        <article className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-green-700">
            Recibidas
          </p>

          <p className="mt-2 text-3xl font-bold text-green-800">
            {stats?.recibidas ?? 0}
          </p>
        </article>

        <article className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-red-700">
            Canceladas
          </p>

          <p className="mt-2 text-3xl font-bold text-red-800">
            {stats?.canceladas ?? 0}
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <label
              htmlFor="search"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Buscar
            </label>

            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Proveedor, moto, repuesto o estado"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="estado-filter"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Estado
            </label>

            <select
              id="estado-filter"
              value={filters.estado ?? ''}
              onChange={(event) =>
                handleFilterChange({
                  estado:
                    (event.target.value ||
                      undefined) as
                      | CompraEstado
                      | undefined,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                Todos
              </option>

              {estadoOptions.map((estado) => (
                <option
                  key={estado}
                  value={estado}
                >
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="fecha-after"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Desde
            </label>

            <input
              id="fecha-after"
              type="date"
              value={
                filters.fechaCompraAfter ?? ''
              }
              onChange={(event) =>
                handleFilterChange({
                  fechaCompraAfter:
                    event.target.value ||
                    undefined,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="fecha-before"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Hasta
            </label>

            <input
              id="fecha-before"
              type="date"
              value={
                filters.fechaCompraBefore ?? ''
              }
              onChange={(event) =>
                handleFilterChange({
                  fechaCompraBefore:
                    event.target.value ||
                    undefined,
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="ordering"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Ordenar por
            </label>

            <select
              id="ordering"
              value={
                filters.ordering ??
                '-fecha_compra'
              }
              onChange={(event) =>
                handleFilterChange({
                  ordering:
                    event.target
                      .value as CompraFilters['ordering'],
                })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="-fecha_compra">
                Más recientes
              </option>

              <option value="fecha_compra">
                Más antiguas
              </option>

              <option value="-subtotal">
                Mayor subtotal
              </option>

              <option value="subtotal">
                Menor subtotal
              </option>

              <option value="-cantidad">
                Mayor cantidad
              </option>

              <option value="cantidad">
                Menor cantidad
              </option>

              <option value="estado">
                Estado A-Z
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch('');

              void fetchCompras({
                page: 1,
                search: undefined,
                estado: undefined,
                fechaCompraAfter: undefined,
                fechaCompraBefore: undefined,
                ordering: '-fecha_compra',
              });
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Compra
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Proveedor
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Producto
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Cantidad
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Precio
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Subtotal
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Estado
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    Cargando compras...
                  </td>
                </tr>
              ) : compras.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No se encontraron compras.
                  </td>
                </tr>
              ) : (
                compras.map((compra) => (
                  <tr
                    key={compra.id_compra}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        #{compra.id_compra}
                      </p>

                      <p className="text-xs text-slate-500">
                        {formatDate(
                          compra.fecha_compra,
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {proveedoresMap.get(
                        compra.proveedor,
                      ) ??
                        `Proveedor #${compra.proveedor}`}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      <p className="font-medium text-slate-800">
                        {getProductoDescription(
                          compra,
                        )}
                      </p>

                      <p className="text-xs text-slate-500">
                        {compra.moto !== null
                          ? 'Moto'
                          : 'Repuesto'}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-slate-700">
                      {compra.cantidad}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-slate-700">
                      {formatCurrency(
                        compra.precio_unitario,
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        compra.subtotal,
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(
                          compra.estado,
                        )}`}
                      >
                        {compra.estado}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(compra)
                          }
                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeletingCompra(
                              compra,
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Página {page} de {totalPages} ·{' '}
            {count} compras
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() =>
                handlePageChange(page - 1)
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={
                page >= totalPages || isLoading
              }
              onClick={() =>
                handlePageChange(page + 1)
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCompra
                    ? `Editar compra #${editingCompra.id_compra}`
                    : 'Registrar compra'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Selecciona un proveedor y una
                  moto o repuesto.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label
                  htmlFor="proveedor"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Proveedor
                </label>

                <select
                  id="proveedor"
                  value={form.proveedor}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      proveedor:
                        event.target.value,
                    }));

                    setFormErrors((current) => ({
                      ...current,
                      proveedor: undefined,
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Selecciona un proveedor
                  </option>

                  {proveedores
                    .filter(
                      (proveedor) =>
                        proveedor.estado,
                    )
                    .map((proveedor) => (
                      <option
                        key={proveedor.id}
                        value={proveedor.id}
                      >
                        {proveedor.nombre}
                      </option>
                    ))}
                </select>

                {formErrors.proveedor && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.proveedor}
                  </p>
                )}
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">
                  Tipo de producto
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-semibold transition ${
                      form.tipoProducto ===
                      'moto'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoProducto"
                      value="moto"
                      checked={
                        form.tipoProducto ===
                        'moto'
                      }
                      onChange={() =>
                        handleTipoProductoChange(
                          'moto',
                        )
                      }
                      className="sr-only"
                    />

                    Moto
                  </label>

                  <label
                    className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-semibold transition ${
                      form.tipoProducto ===
                      'repuesto'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoProducto"
                      value="repuesto"
                      checked={
                        form.tipoProducto ===
                        'repuesto'
                      }
                      onChange={() =>
                        handleTipoProductoChange(
                          'repuesto',
                        )
                      }
                      className="sr-only"
                    />

                    Repuesto
                  </label>
                </div>
              </fieldset>

              {form.tipoProducto === 'moto' ? (
                <div>
                  <label
                    htmlFor="moto"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Moto
                  </label>

                  <select
                    id="moto"
                    value={form.moto}
                    onChange={(event) =>
                      handleMotoChange(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Selecciona una moto
                    </option>

                    {motos.map((moto) => (
                      <option
                        key={moto.idMoto}
                        value={moto.idMoto}
                      >
                        {moto.marca}{' '}
                        {moto.modelo} (
                        {moto.anio}) - Stock:{' '}
                        {moto.stock} -{' '}
                        {formatCurrency(
                          moto.precio,
                        )}
                      </option>
                    ))}
                  </select>

                  {formErrors.moto && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.moto}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="repuesto"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Repuesto
                  </label>

                  <select
                    id="repuesto"
                    value={form.repuesto}
                    onChange={(event) =>
                      handleRepuestoChange(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Selecciona un repuesto
                    </option>

                    {repuestos.map(
                      (repuesto) => (
                        <option
                          key={
                            repuesto.idRepuesto
                          }
                          value={
                            repuesto.idRepuesto
                          }
                        >
                          {repuesto.nombre} -{' '}
                          {repuesto.sku} -
                          Stock:{' '}
                          {repuesto.stock} -{' '}
                          {formatCurrency(
                            repuesto.costo,
                          )}
                        </option>
                      ),
                    )}
                  </select>

                  {formErrors.repuesto && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.repuesto}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="cantidad"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Cantidad
                  </label>

                  <input
                    id="cantidad"
                    type="number"
                    min="1"
                    step="1"
                    value={form.cantidad}
                    onChange={(event) =>
                      handleCantidadChange(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                  {formErrors.cantidad && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.cantidad}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="precio-unitario"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Precio unitario
                  </label>

                  <input
                    id="precio-unitario"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      form.precioUnitario
                    }
                    onChange={(event) =>
                      handlePrecioChange(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                  {formErrors.precio_unitario && (
                    <p className="mt-1 text-xs text-red-600">
                      {
                        formErrors.precio_unitario
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="subtotal"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Subtotal
                  </label>

                  <input
                    id="subtotal"
                    type="text"
                    value={form.subtotal}
                    readOnly
                    className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700"
                  />

                  {formErrors.subtotal && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.subtotal}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="estado"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Estado
                </label>

                <select
                  id="estado"
                  value={form.estado}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      estado:
                        event.target
                          .value as CompraEstado,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  {estadoOptions.map((estado) => (
                    <option
                      key={estado}
                      value={estado}
                    >
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={closeFormModal}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? 'Guardando...'
                    : editingCompra
                      ? 'Guardar cambios'
                      : 'Registrar compra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCompra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">
              Eliminar compra
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              ¿Estás seguro de eliminar la compra{' '}
              <strong>
                #{deletingCompra.id_compra}
              </strong>
              ? Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  setDeletingCompra(null)
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  void handleDelete()
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving
                  ? 'Eliminando...'
                  : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}