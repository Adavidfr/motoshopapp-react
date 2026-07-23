import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit,
  Loader2,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';

import type {
  Compra,
  CompraEstado,
} from '../../../domain/entities/compra.entity';

import { transicionesCompraPermitidas } from '../../../domain/entities/compra.entity';

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
    recibirCompra,
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
      fetchRepuestos({ limit: 100 }),
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

  const handleRecibir = async (compra: Compra) => {
    if (isSaving || compra.estado !== 'Pendiente') return;
    if (!confirm(`¿Recibir la compra #${compra.id_compra}? Se incrementará el inventario.`)) return;
    await recibirCompra(compra.id_compra);
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
          'border-green-500/20 bg-green-500/10 ' +
          'text-green-400'
        );

      case 'Cancelada':
        return (
          'border-destructive/20 bg-destructive/10 ' +
          'text-destructive'
        );

      default:
        return (
          'border-amber-500/20 bg-amber-500/10 ' +
          'text-amber-400'
        );
    }
  };

  const displayedRange = useMemo(() => {
    if (count === 0) {
      return '0 resultados';
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, count);

    return `${start}-${end} de ${count}`;
  }, [count, page, pageSize]);

  const estadoFormOptions = useMemo((): CompraEstado[] => {
    if (!editingCompra) return ['Pendiente'];
    const opts = [editingCompra.estado, ...transicionesCompraPermitidas(editingCompra.estado)];
    return [...new Set(opts)];
  }, [editingCompra]);

  const clearFilters = () => {
    setSearch('');

    void fetchCompras({
      page: 1,
      search: undefined,
      estado: undefined,
      fechaCompraAfter: undefined,
      fechaCompraBefore: undefined,
      ordering: '-fecha_compra',
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
            Administrar compras
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona las compras de motos y repuestos realizadas a proveedores.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-[0_4px_20px_rgba(255,26,26,0.25)] transition-all hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Nueva compra
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
          title="Total de compras"
          value={stats?.total ?? count}
          icon={<ClipboardList className="size-5" />}
        />

        <StatCard
          title="Pendientes"
          value={stats?.pendientes ?? 0}
          icon={<ShoppingCart className="size-5" />}
        />

        <StatCard
          title="Recibidas"
          value={stats?.recibidas ?? 0}
          icon={<PackageCheck className="size-5" />}
        />

        <StatCard
          title="Canceladas"
          value={stats?.canceladas ?? 0}
          icon={<X className="size-5" />}
        />
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-4 shadow-2xl md:p-5">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />

            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Proveedor, moto, repuesto o estado..."
              className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-11 text-sm font-semibold text-foreground placeholder:text-neutral-600 focus:border-primary/80 focus:outline-none focus:ring-4 focus:ring-primary/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <select
            id="estado-filter"
            value={filters.estado ?? ''}
            onChange={(event) =>
              handleFilterChange({
                estado:
                  (event.target.value || undefined) as
                    | CompraEstado
                    | undefined,
              })
            }
            className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
          >
            <option value="">Todos los estados</option>

            {estadoOptions.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <input
            id="fecha-after"
            type="date"
            value={filters.fechaCompraAfter ?? ''}
            onChange={(event) =>
              handleFilterChange({
                fechaCompraAfter:
                  event.target.value || undefined,
              })
            }
            className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
            title="Fecha desde"
          />

          <input
            id="fecha-before"
            type="date"
            value={filters.fechaCompraBefore ?? ''}
            onChange={(event) =>
              handleFilterChange({
                fechaCompraBefore:
                  event.target.value || undefined,
              })
            }
            className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
            title="Fecha hasta"
          />
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            id="ordering"
            value={filters.ordering ?? '-fecha_compra'}
            onChange={(event) =>
              handleFilterChange({
                ordering:
                  event.target.value as CompraFilters['ordering'],
              })
            }
            className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary sm:min-w-64"
          >
            <option value="-fecha_compra">Más recientes</option>
            <option value="fecha_compra">Más antiguas</option>
            <option value="-subtotal">Mayor subtotal</option>
            <option value="subtotal">Menor subtotal</option>
            <option value="-cantidad">Mayor cantidad</option>
            <option value="cantidad">Menor cantidad</option>
            <option value="estado">Estado A-Z</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full bg-muted px-5 py-3 text-xs font-black uppercase tracking-wider text-foreground transition-colors hover:bg-neutral-700"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
        {isLoading && compras.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : compras.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
            <ShoppingCart className="mb-4 size-12 text-neutral-700" />

            <h2 className="text-lg font-black uppercase text-foreground">
              No se encontraron compras
            </h2>

            <p className="mt-2 max-w-md text-sm text-neutral-500">
              Modifica los filtros o registra una nueva compra.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-950 text-xs font-black uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Compra</th>
                  <th className="px-6 py-4">Proveedor</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4 text-right">Cantidad</th>
                  <th className="px-6 py-4 text-right">Precio</th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-950 text-sm">
                {compras.map((compra) => (
                  <tr
                    key={compra.id_compra}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                          <ShoppingCart className="size-4" />
                        </div>

                        <div>
                          <p className="font-bold text-foreground">
                            #{compra.id_compra}
                          </p>

                          <p className="mt-1 text-xs text-neutral-600">
                            {formatDate(compra.fecha_compra)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {proveedoresMap.get(compra.proveedor) ??
                        `Proveedor #${compra.proveedor}`}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">
                        {getProductoDescription(compra)}
                      </p>

                      <p className="mt-1 text-xs text-neutral-600">
                        {compra.moto !== null ? 'Moto' : 'Repuesto'}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {compra.cantidad}
                    </td>

                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {formatCurrency(compra.precio_unitario)}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-foreground">
                      {formatCurrency(compra.subtotal)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${getEstadoClasses(
                          compra.estado,
                        )}`}
                      >
                        {compra.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {compra.estado === 'Pendiente' && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handleRecibir(compra)}
                            className="rounded-full bg-green-500/10 p-2 text-green-400 transition-all hover:bg-green-500/20 disabled:opacity-50"
                            title="Recibir compra"
                          >
                            <PackageCheck className="size-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditModal(compra)}
                          disabled={isSaving}
                          className="rounded-full bg-muted p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-50"
                          title="Editar compra"
                        >
                          <Edit className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingCompra(compra)}
                          disabled={isSaving}
                          className="rounded-full bg-destructive/10 p-2 text-destructive transition-all hover:bg-destructive/20 disabled:opacity-50"
                          title="Eliminar compra"
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
              disabled={page <= 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
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
              onClick={() => handlePageChange(page + 1)}
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border border-border bg-card p-7 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
                  Compras
                </p>

                <h2 className="mt-2 text-2xl font-black uppercase text-foreground">
                  {editingCompra
                    ? `Editar compra #${editingCompra.id_compra}`
                    : 'Nueva compra'}
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Selecciona un proveedor y una moto o repuesto.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={isSaving}
                className="rounded-full bg-muted p-2 text-neutral-500 transition-colors hover:text-foreground disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField
                label="Proveedor"
                required
                error={formErrors.proveedor}
              >
                <select
                  value={form.proveedor}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      proveedor: event.target.value,
                    }));

                    setFormErrors((current) => ({
                      ...current,
                      proveedor: undefined,
                    }));
                  }}
                  className={inputClass(Boolean(formErrors.proveedor))}
                >
                  <option value="">Selecciona un proveedor</option>

                  {proveedores
                    .filter((proveedor) => proveedor.estado)
                    .map((proveedor) => (
                      <option
                        key={proveedor.id}
                        value={proveedor.id}
                      >
                        {proveedor.nombre}
                      </option>
                    ))}
                </select>
              </FormField>

              <FormField label="Tipo de producto" required>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTipoProductoChange('moto')}
                    className={`rounded-full border py-3 text-xs font-black uppercase tracking-wider transition-colors ${
                      form.tipoProducto === 'moto'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-neutral-500 hover:text-primary-foreground'
                    }`}
                  >
                    Moto
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTipoProductoChange('repuesto')}
                    className={`rounded-full border py-3 text-xs font-black uppercase tracking-wider transition-colors ${
                      form.tipoProducto === 'repuesto'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-neutral-500 hover:text-primary-foreground'
                    }`}
                  >
                    Repuesto
                  </button>
                </div>
              </FormField>

              {form.tipoProducto === 'moto' ? (
                <FormField
                  label="Moto"
                  required
                  error={formErrors.moto}
                >
                  <select
                    value={form.moto}
                    onChange={(event) =>
                      handleMotoChange(event.target.value)
                    }
                    className={inputClass(Boolean(formErrors.moto))}
                  >
                    <option value="">Selecciona una moto</option>

                    {motos.map((moto) => (
                      <option
                        key={moto.idMoto}
                        value={moto.idMoto}
                      >
                        {moto.marca} {moto.modelo} ({moto.anio}) -
                        Stock: {moto.stock} -{' '}
                        {formatCurrency(moto.precio)}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : (
                <FormField
                  label="Repuesto"
                  required
                  error={formErrors.repuesto}
                >
                  <select
                    value={form.repuesto}
                    onChange={(event) =>
                      handleRepuestoChange(event.target.value)
                    }
                    className={inputClass(Boolean(formErrors.repuesto))}
                  >
                    <option value="">Selecciona un repuesto</option>

                    {repuestos.map((repuesto) => (
                      <option
                        key={repuesto.idRepuesto}
                        value={repuesto.idRepuesto}
                      >
                        {repuesto.nombre} - {repuesto.sku} - Stock:{' '}
                        {repuesto.stock} -{' '}
                        {formatCurrency(repuesto.costo)}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <FormField
                  label="Cantidad"
                  required
                  error={formErrors.cantidad}
                >
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.cantidad}
                    onChange={(event) =>
                      handleCantidadChange(event.target.value)
                    }
                    className={inputClass(Boolean(formErrors.cantidad))}
                  />
                </FormField>

                <FormField
                  label="Precio unitario"
                  required
                  error={formErrors.precio_unitario}
                >
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.precioUnitario}
                    onChange={(event) =>
                      handlePrecioChange(event.target.value)
                    }
                    className={inputClass(
                      Boolean(formErrors.precio_unitario),
                    )}
                  />
                </FormField>

                <FormField
                  label="Subtotal"
                  required
                  error={formErrors.subtotal}
                >
                  <input
                    type="text"
                    value={form.subtotal}
                    readOnly
                    className="w-full rounded-full border border-border bg-muted px-5 py-3 text-sm font-bold text-muted-foreground outline-none"
                  />
                </FormField>
              </div>

              <FormField
                label="Estado"
                required
                error={formErrors.estado}
              >
                <select
                  value={form.estado}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      estado: event.target.value as CompraEstado,
                    }))
                  }
                  disabled={!editingCompra}
                  className={inputClass(Boolean(formErrors.estado))}
                >
                  {estadoFormOptions.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
                {!editingCompra && (
                  <p className="px-2 text-[11px] text-muted-foreground">
                    Las compras nuevas se registran como Pendiente. Use Recibir para aplicar inventario.
                  </p>
                )}
              </FormField>

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={closeFormModal}
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
              <Trash2 className="size-6" />
            </div>

            <h2 className="text-center text-xl font-black uppercase text-foreground">
              Eliminar compra
            </h2>

            <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
              Se eliminará la compra{' '}
              <span className="font-bold text-foreground">
                #{deletingCompra.id_compra}
              </span>
              . Esta acción no se puede deshacer.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setDeletingCompra(null)}
                className="w-full rounded-full border border-border py-3 text-xs font-black uppercase text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleDelete()}
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
