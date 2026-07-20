import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  Mantenimiento,
  MantenimientoEstado,
} from '../../../domain/entities/mantenimiento.entity';

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';

import type {
  MantenimientoDto,
} from '../../../application/dtos/mantenimiento.dto';

import type {
  User,
} from '../../../domain/entities/user.entity';

import { httpClient } from '../../../infrastructure/http/axios-client';

import {
  useMantenimientoStore,
} from '../../store/mantenimiento.store';

import {
  useMotoStore,
} from '../../store/moto.store';

import {
  useServicioStore,
} from '../../store/servicio.store';

interface MantenimientoFormState {
  moto: string;
  usuarioCliente: string;
  servicio: string;
  kilometrajeActual: string;
  diagnosticoInicial: string;
  costoFinal: string;
  estado: MantenimientoEstado;
}

interface UserApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_staff: boolean;
    is_active: boolean;
    date_joined: string;
    role: string;
    num_orders: number;
  }>;
}

const initialFormState: MantenimientoFormState = {
  moto: '',
  usuarioCliente: '',
  servicio: '',
  kilometrajeActual: '',
  diagnosticoInicial: '',
  costoFinal: '',
  estado: 'Pendiente',
};

const estados: MantenimientoEstado[] = [
  'Pendiente',
  'En proceso',
  'Finalizado',
  'Cancelado',
];

const formatCurrency = (
  value: number,
): string => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const formatDate = (
  value: string,
): string => {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getEstadoClasses = (
  estado: MantenimientoEstado,
): string => {
  switch (estado) {
    case 'Pendiente':
      return 'border border-amber-500/20 bg-amber-500/10 text-amber-400';

    case 'En proceso':
      return 'border border-blue-500/20 bg-blue-500/10 text-blue-400';

    case 'Finalizado':
      return 'border border-green-500/20 bg-green-500/10 text-green-400';

    case 'Cancelado':
      return 'border border-destructive/20 bg-destructive/10 text-destructive';

    default:
      return 'border border-neutral-700 bg-neutral-800 text-neutral-300';
  }
};

const mapUser = (
  data: UserApiResponse['results'][number],
): User => {
  return {
    id: Number(data.id),
    username: data.username ?? '',
    email: data.email ?? '',
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    isStaff: Boolean(data.is_staff),
    isActive: Boolean(data.is_active),
    dateJoined: data.date_joined ?? '',
    role: data.role ?? 'usuario',
    numOrders: Number(data.num_orders ?? 0),
  };
};

const getUserName = (
  user: User,
): string => {
  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || user.username;
};

export default function MantenimientosAdminPage() {
  const {
    mantenimientos,
    stats,
    count,
    filters,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchMantenimientos,
    fetchStats,
    createMantenimiento,
    updateMantenimiento,
    deleteMantenimiento,
    clearMessages,
  } = useMantenimientoStore();

  const {
    motos,
    fetchMotos,
  } = useMotoStore();

  const {
    servicios,
    fetchServicios,
  } = useServicioStore();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] =
    useState(false);
  const [usersError, setUsersError] =
    useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    editingMantenimiento,
    setEditingMantenimiento,
  ] = useState<Mantenimiento | null>(null);

  const [form, setForm] =
    useState<MantenimientoFormState>(
      initialFormState,
    );

  const [formError, setFormError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  const [estadoFilter, setEstadoFilter] =
    useState('');

  const [servicioFilter, setServicioFilter] =
    useState('');

  const [motoFilter, setMotoFilter] =
    useState('');

  const [deleteTarget, setDeleteTarget] =
    useState<Mantenimiento | null>(null);

  const page =
    filters.page ?? 1;

  const pageSize =
    filters.pageSize ?? 10;

  const totalPages = Math.max(
    1,
    Math.ceil(count / pageSize),
  );

  useEffect(() => {
  void Promise.all([
    fetchMantenimientos(),
    fetchStats(),
    fetchMotos(),
    fetchServicios({
      page: 1,
      pageSize: 100,
      estado: true,
    }),
    fetchUsers(),
  ]);
  }, []);  

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      clearMessages();
    }, 3500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successMessage, clearMessages]);

  const motoById = useMemo(() => {
    return new Map(
      motos.map((moto) => [
        moto.idMoto,
        moto,
      ]),
    );
  }, [motos]);

  const servicioById = useMemo(() => {
    return new Map(
      servicios.map((servicio) => [
        servicio.id,
        servicio,
      ]),
    );
  }, [servicios]);

  const userById = useMemo(() => {
    return new Map(
      users.map((user) => [
        user.id,
        user,
      ]),
    );
  }, [users]);

  async function fetchUsers(): Promise<void> {
    setIsLoadingUsers(true);
    setUsersError(null);

    try {
      const response =
        await httpClient.get<UserApiResponse>(
          '/users/',
          {
            params: {
              page: 1,
              page_size: 100,
              role: 'usuario',
              is_staff: false,
              is_active: true,
              ordering: 'username',
            },
          },
        );

      setUsers(
        response.data.results.map(mapUser),
      );
    } catch (requestError) {
      console.error(requestError);

      setUsersError(
        'No se pudo cargar la lista de clientes.',
      );
    } finally {
      setIsLoadingUsers(false);
    }
  }

  const handleOpenCreateModal = () => {
    clearMessages();
    setEditingMantenimiento(null);
    setForm(initialFormState);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (
    mantenimiento: Mantenimiento,
  ) => {
    clearMessages();

    setEditingMantenimiento(
      mantenimiento,
    );

    setForm({
      moto: String(mantenimiento.moto),
      usuarioCliente: String(
        mantenimiento.usuarioCliente,
      ),
      servicio: String(
        mantenimiento.servicio,
      ),
      kilometrajeActual: String(
        mantenimiento.kilometrajeActual,
      ),
      diagnosticoInicial:
        mantenimiento.diagnosticoInicial ??
        '',
      costoFinal: String(
        mantenimiento.costoFinal,
      ),
      estado: mantenimiento.estado,
    });

    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingMantenimiento(null);
    setForm(initialFormState);
    setFormError(null);
  };

  const handleFormChange = (
    field: keyof MantenimientoFormState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFormError(null);
  };

  const handleServicioChange = (
    servicioId: string,
  ) => {
    const servicio = servicioById.get(
      Number(servicioId),
    );

    setForm((current) => ({
      ...current,
      servicio: servicioId,
      costoFinal:
        servicio?.precio_base ??
        current.costoFinal,
    }));

    setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!form.moto) {
      setFormError(
        'Selecciona una moto.',
      );
      return false;
    }

    if (!form.usuarioCliente) {
      setFormError(
        'Selecciona un cliente.',
      );
      return false;
    }

    if (!form.servicio) {
      setFormError(
        'Selecciona un servicio.',
      );
      return false;
    }

    const kilometraje = Number(
      form.kilometrajeActual,
    );

    if (
      !Number.isFinite(kilometraje) ||
      kilometraje < 0
    ) {
      setFormError(
        'El kilometraje debe ser un número igual o mayor que cero.',
      );
      return false;
    }

    const costo = Number(
      form.costoFinal,
    );

    if (
      !Number.isFinite(costo) ||
      costo < 0
    ) {
      setFormError(
        'El costo final debe ser un número igual o mayor que cero.',
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dto: MantenimientoDto = {
      moto: Number(form.moto),
      usuarioCliente: Number(
        form.usuarioCliente,
      ),
      servicio: Number(
        form.servicio,
      ),
      kilometrajeActual: Number(
        form.kilometrajeActual,
      ),
      diagnosticoInicial:
        form.diagnosticoInicial.trim() ||
        null,
      costoFinal: Number(
        form.costoFinal,
      ),
      estado: form.estado,
    };

    let wasSuccessful = false;

    if (editingMantenimiento) {
      wasSuccessful =
        await updateMantenimiento(
          editingMantenimiento.idMantenimiento,
          dto,
        );
    } else {
      wasSuccessful =
        await createMantenimiento(dto);
    }

    if (wasSuccessful) {
      handleCloseModal();
    }
  };

  const handleSearch = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    await fetchMantenimientos({
      page: 1,
      search: search.trim() || undefined,
      estado:
        estadoFilter || undefined,
      servicio: servicioFilter
        ? Number(servicioFilter)
        : undefined,
      moto: motoFilter
        ? Number(motoFilter)
        : undefined,
    });
  };

  const handleClearFilters = async () => {
    setSearch('');
    setEstadoFilter('');
    setServicioFilter('');
    setMotoFilter('');

    await fetchMantenimientos({
      page: 1,
      search: undefined,
      estado: undefined,
      servicio: undefined,
      moto: undefined,
    });
  };

  const handleChangePage = async (
    newPage: number,
  ) => {
    if (
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {
      return;
    }

    await fetchMantenimientos({
      page: newPage,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const wasSuccessful =
      await deleteMantenimiento(
        deleteTarget.idMantenimiento,
      );

    if (wasSuccessful) {
      setDeleteTarget(null);
    }
  };

  const getMotoLabel = (
    motoId: number,
  ): string => {
    const moto = motoById.get(motoId);

    if (!moto) {
      return `Moto #${motoId}`;
    }

    const marca =
      typeof moto.marca === 'object' &&
      moto.marca !== null &&
      'nombre' in moto.marca
        ? String(moto.marca.nombre)
        : '';

    return [marca, moto.modelo]
      .filter(Boolean)
      .join(' ');
  };

  const getServicioLabel = (
    servicioId: number,
  ): string => {
    return (
      servicioById.get(servicioId)
        ?.nombre ??
      `Servicio #${servicioId}`
    );
  };

  const getClienteLabel = (
    userId: number,
  ): string => {
    const user = userById.get(userId);

    if (!user) {
      return `Cliente #${userId}`;
    }

    return getUserName(user);
  };

  const displayedRange = useMemo(() => {
    if (count === 0) {
      return '0 resultados';
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, count);

    return `${start}-${end} de ${count}`;
  }, [count, page, pageSize]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
            Taller
          </p>

          <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            Administrar mantenimientos
          </h1>

          <p className="mt-2 text-sm text-neutral-400">
            Administra los mantenimientos, servicios y estados de las motos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(255,26,26,0.25)] transition-all hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Nuevo mantenimiento
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

      {usersError && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center text-xs font-semibold text-amber-400">
          {usersError}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total"
          value={stats?.total ?? count}
          icon={<ClipboardList className="size-5" />}
        />

        <StatCard
          title="Pendientes"
          value={stats?.pendientes ?? 0}
          icon={<Wrench className="size-5" />}
        />

        <StatCard
          title="En proceso"
          value={stats?.enProceso ?? 0}
          icon={<Loader2 className="size-5" />}
        />

        <StatCard
          title="Finalizados"
          value={stats?.finalizados ?? 0}
          icon={<Wrench className="size-5" />}
        />

        <StatCard
          title="Cancelados"
          value={stats?.cancelados ?? 0}
          icon={<X className="size-5" />}
        />
      </section>

      <section className="rounded-[2rem] border border-neutral-900 bg-[#0c0c0e] p-4 shadow-2xl md:p-5">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-3 xl:grid-cols-5"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />

            <input
              id="search"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Cliente, moto, servicio..."
              className="w-full rounded-full border border-neutral-800 bg-[#141417] py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder:text-neutral-600 focus:border-primary/80 focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <select
            id="filter-estado"
            value={estadoFilter}
            onChange={(event) => {
              setEstadoFilter(event.target.value);
            }}
            className="rounded-full border border-neutral-800 bg-[#141417] px-5 py-3 text-sm font-semibold text-white outline-none focus:border-primary"
          >
            <option value="">Todos los estados</option>

            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <select
            id="filter-moto"
            value={motoFilter}
            onChange={(event) => {
              setMotoFilter(event.target.value);
            }}
            className="rounded-full border border-neutral-800 bg-[#141417] px-5 py-3 text-sm font-semibold text-white outline-none focus:border-primary"
          >
            <option value="">Todas las motos</option>

            {motos.map((moto) => (
              <option key={moto.idMoto} value={moto.idMoto}>
                {getMotoLabel(moto.idMoto)}
              </option>
            ))}
          </select>

          <select
            id="filter-servicio"
            value={servicioFilter}
            onChange={(event) => {
              setServicioFilter(event.target.value);
            }}
            className="rounded-full border border-neutral-800 bg-[#141417] px-5 py-3 text-sm font-semibold text-white outline-none focus:border-primary"
          >
            <option value="">Todos los servicios</option>

            {servicios.map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.nombre}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-full bg-primary px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Filtrar
            </button>

            <button
              type="button"
              onClick={() => {
                void handleClearFilters();
              }}
              disabled={isLoading}
              className="rounded-full bg-neutral-800 px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-neutral-900 bg-[#0c0c0e] shadow-2xl">
        {isLoading && mantenimientos.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        ) : mantenimientos.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
            <Wrench className="mb-4 size-12 text-neutral-700" />

            <h2 className="text-lg font-black uppercase text-white">
              No existen mantenimientos
            </h2>

            <p className="mt-2 max-w-md text-sm text-neutral-500">
              Modifica los filtros o registra un nuevo mantenimiento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-950 text-xs font-black uppercase tracking-wider text-neutral-400">
                  <th className="px-6 py-4">Mantenimiento</th>
                  <th className="px-6 py-4">Moto</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Kilometraje</th>
                  <th className="px-6 py-4">Costo</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-950 text-sm">
                {mantenimientos.map((mantenimiento) => (
                  <tr
                    key={mantenimiento.idMantenimiento}
                    className="transition-colors hover:bg-neutral-900/20"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                          <Wrench className="size-4" />
                        </div>

                        <p className="font-bold text-white">
                          #{mantenimiento.idMantenimiento}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-white">
                      {getMotoLabel(mantenimiento.moto)}
                    </td>

                    <td className="px-6 py-4 text-neutral-400">
                      {getClienteLabel(
                        mantenimiento.usuarioCliente,
                      )}
                    </td>

                    <td className="px-6 py-4 text-neutral-400">
                      {getServicioLabel(mantenimiento.servicio)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-neutral-300">
                      {mantenimiento.kilometrajeActual.toLocaleString(
                        'es-EC',
                      )}{' '}
                      km
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 font-bold text-white">
                      {formatCurrency(mantenimiento.costoFinal)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${getEstadoClasses(
                          mantenimiento.estado,
                        )}`}
                      >
                        {mantenimiento.estado}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-neutral-500">
                      {formatDate(mantenimiento.fechaRegistro)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenEditModal(mantenimiento);
                          }}
                          className="rounded-full bg-neutral-900 p-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white"
                          title="Editar mantenimiento"
                        >
                          <Edit className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(mantenimiento);
                          }}
                          className="rounded-full bg-destructive/10 p-2 text-destructive transition-all hover:bg-destructive/20"
                          title="Eliminar mantenimiento"
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
              onClick={() => {
                void handleChangePage(page - 1);
              }}
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
              disabled={page >= totalPages || isLoading}
              onClick={() => {
                void handleChangePage(page + 1);
              }}
              className="flex size-9 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-[2.5rem] border border-neutral-900 bg-[#0c0c0e] p-7 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">
                  Taller
                </p>

                <h2 className="mt-2 text-2xl font-black uppercase text-white">
                  {editingMantenimiento
                    ? 'Editar mantenimiento'
                    : 'Nuevo mantenimiento'}
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Completa la información del mantenimiento.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="rounded-full bg-neutral-900 p-2 text-neutral-500 transition-colors hover:text-white disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {(formError || error) && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-xs font-semibold text-destructive">
                  {formError || error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Moto" required>
                  <select
                    id="mantenimiento-moto"
                    required
                    value={form.moto}
                    onChange={(event) => {
                      handleFormChange('moto', event.target.value);
                    }}
                    className={inputClass()}
                  >
                    <option value="">Selecciona una moto</option>

                    {motos.map((moto) => (
                      <option key={moto.idMoto} value={moto.idMoto}>
                        {getMotoLabel(moto.idMoto)}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Cliente" required>
                  <select
                    id="mantenimiento-cliente"
                    required
                    disabled={isLoadingUsers}
                    value={form.usuarioCliente}
                    onChange={(event) => {
                      handleFormChange(
                        'usuarioCliente',
                        event.target.value,
                      );
                    }}
                    className={inputClass()}
                  >
                    <option value="">
                      {isLoadingUsers
                        ? 'Cargando clientes...'
                        : 'Selecciona un cliente'}
                    </option>

                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {getUserName(user)}
                        {user.email ? ` - ${user.email}` : ''}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Servicio" required>
                  <select
                    id="mantenimiento-servicio"
                    required
                    value={form.servicio}
                    onChange={(event) => {
                      handleServicioChange(event.target.value);
                    }}
                    className={inputClass()}
                  >
                    <option value="">Selecciona un servicio</option>

                    {servicios
                      .filter(
                        (servicio) =>
                          servicio.estado ||
                          String(servicio.id) === form.servicio,
                      )
                      .map((servicio) => (
                        <option
                          key={servicio.id}
                          value={servicio.id}
                        >
                          {servicio.nombre} -{' '}
                          {formatCurrency(
                            Number(servicio.precio_base),
                          )}
                        </option>
                      ))}
                  </select>
                </FormField>

                <FormField label="Kilometraje actual" required>
                  <input
                    id="mantenimiento-kilometraje"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.kilometrajeActual}
                    onChange={(event) => {
                      handleFormChange(
                        'kilometrajeActual',
                        event.target.value,
                      );
                    }}
                    placeholder="Ej. 18500"
                    className={inputClass()}
                  />
                </FormField>

                <FormField label="Costo final" required>
                  <input
                    id="mantenimiento-costo"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.costoFinal}
                    onChange={(event) => {
                      handleFormChange(
                        'costoFinal',
                        event.target.value,
                      );
                    }}
                    placeholder="0.00"
                    className={inputClass()}
                  />
                </FormField>

                <FormField label="Estado" required>
                  <select
                    id="mantenimiento-estado"
                    required
                    value={form.estado}
                    onChange={(event) => {
                      handleFormChange(
                        'estado',
                        event.target.value,
                      );
                    }}
                    className={inputClass()}
                  >
                    {estados.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Diagnóstico inicial">
                    <textarea
                      id="mantenimiento-diagnostico"
                      rows={4}
                      value={form.diagnosticoInicial}
                      onChange={(event) => {
                        handleFormChange(
                          'diagnosticoInicial',
                          event.target.value,
                        );
                      }}
                      placeholder="Describe el diagnóstico inicial de la moto..."
                      className={textareaClass()}
                    />
                  </FormField>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                    : editingMantenimiento
                      ? 'Guardar cambios'
                      : 'Crear mantenimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2.5rem] border border-neutral-900 bg-[#0c0c0e] p-8 shadow-2xl">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
              <Trash2 className="size-6" />
            </div>

            <h2 className="text-center text-xl font-black uppercase text-white">
              Eliminar mantenimiento
            </h2>

            <p className="mt-3 text-center text-sm leading-relaxed text-neutral-400">
              Se eliminará el mantenimiento{' '}
              <span className="font-bold text-white">
                #{deleteTarget.idMantenimiento}
              </span>
              . Esta acción no se puede deshacer.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setDeleteTarget(null);
                }}
                className="w-full rounded-full border border-neutral-800 py-3 text-xs font-black uppercase text-neutral-400 transition-colors hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  void handleConfirmDelete();
                }}
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
    </main>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
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
  children: ReactNode;
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
    'text-sm font-semibold text-white placeholder:text-neutral-600',
    'outline-none transition focus:border-primary/80 focus:ring-4 focus:ring-primary/10',
    'disabled:cursor-not-allowed disabled:bg-neutral-900 disabled:text-neutral-600',
  ].join(' ');
}

function textareaClass(): string {
  return [
    'w-full resize-y rounded-3xl border border-neutral-800 bg-[#141417] px-5 py-4',
    'text-sm font-semibold text-white placeholder:text-neutral-600',
    'outline-none transition focus:border-primary/80 focus:ring-4 focus:ring-primary/10',
  ].join(' ');
}
