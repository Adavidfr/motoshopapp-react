import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  Mantenimiento,
  MantenimientoEstado,
} from '../../../domain/entities/mantenimiento.entity';

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
      return 'bg-amber-100 text-amber-800';

    case 'En proceso':
      return 'bg-blue-100 text-blue-800';

    case 'Finalizado':
      return 'bg-green-100 text-green-800';

    case 'Cancelado':
      return 'bg-red-100 text-red-800';

    default:
      return 'bg-gray-100 text-gray-800';
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

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mantenimientos
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Administra los mantenimientos,
              servicios y estados de las motos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Nuevo mantenimiento
          </button>
        </section>

        {successMessage && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {usersError && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {usersError}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats?.total ?? 0}
            </p>
          </article>

          <article className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm text-amber-700">
              Pendientes
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-900">
              {stats?.pendientes ?? 0}
            </p>
          </article>

          <article className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm text-blue-700">
              En proceso
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-900">
              {stats?.enProceso ?? 0}
            </p>
          </article>

          <article className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <p className="text-sm text-green-700">
              Finalizados
            </p>

            <p className="mt-2 text-3xl font-bold text-green-900">
              {stats?.finalizados ?? 0}
            </p>
          </article>

          <article className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm text-red-700">
              Cancelados
            </p>

            <p className="mt-2 text-3xl font-bold text-red-900">
              {stats?.cancelados ?? 0}
            </p>
          </article>
        </section>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
          >
            <div>
              <label
                htmlFor="search"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Buscar
              </label>

              <input
                id="search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Cliente, moto, servicio..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-600"
              />
            </div>

            <div>
              <label
                htmlFor="filter-estado"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Estado
              </label>

              <select
                id="filter-estado"
                value={estadoFilter}
                onChange={(event) => {
                  setEstadoFilter(
                    event.target.value,
                  );
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-600"
              >
                <option value="">
                  Todos
                </option>

                {estados.map((estado) => (
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
                htmlFor="filter-moto"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Moto
              </label>

              <select
                id="filter-moto"
                value={motoFilter}
                onChange={(event) => {
                  setMotoFilter(
                    event.target.value,
                  );
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-600"
              >
                <option value="">
                  Todas
                </option>

                {motos.map((moto) => (
                  <option
                    key={moto.idMoto}
                    value={moto.idMoto}
                  >
                    {getMotoLabel(
                      moto.idMoto,
                    )}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-servicio"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Servicio
              </label>

              <select
                id="filter-servicio"
                value={servicioFilter}
                onChange={(event) => {
                  setServicioFilter(
                    event.target.value,
                  );
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-600"
              >
                <option value="">
                  Todos
                </option>

                {servicios.map(
                  (servicio) => (
                    <option
                      key={servicio.id}
                      value={servicio.id}
                    >
                      {servicio.nombre}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Filtrar
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleClearFilters();
                }}
                disabled={isLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
              >
                Limpiar
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    ID
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Moto
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Cliente
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Servicio
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Kilometraje
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Costo
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Estado
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Fecha
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-sm text-gray-500"
                    >
                      Cargando mantenimientos...
                    </td>
                  </tr>
                ) : mantenimientos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-sm text-gray-500"
                    >
                      No existen mantenimientos
                      registrados.
                    </td>
                  </tr>
                ) : (
                  mantenimientos.map(
                    (mantenimiento) => (
                      <tr
                        key={
                          mantenimiento.idMantenimiento
                        }
                        className="hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                          #
                          {
                            mantenimiento.idMantenimiento
                          }
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-700">
                          {getMotoLabel(
                            mantenimiento.moto,
                          )}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-700">
                          {getClienteLabel(
                            mantenimiento.usuarioCliente,
                          )}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-700">
                          {getServicioLabel(
                            mantenimiento.servicio,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                          {mantenimiento.kilometrajeActual.toLocaleString(
                            'es-EC',
                          )}{' '}
                          km
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(
                            mantenimiento.costoFinal,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getEstadoClasses(
                              mantenimiento.estado,
                            )}`}
                          >
                            {
                              mantenimiento.estado
                            }
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {formatDate(
                            mantenimiento.fechaRegistro,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEditModal(
                                  mantenimiento,
                                );
                              }}
                              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(
                                  mantenimiento,
                                );
                              }}
                              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              Página {page} de {totalPages}.
              Total: {count} registros.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  page <= 1 || isLoading
                }
                onClick={() => {
                  void handleChangePage(
                    page - 1,
                  );
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages ||
                  isLoading
                }
                onClick={() => {
                  void handleChangePage(
                    page + 1,
                  );
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingMantenimiento
                    ? 'Editar mantenimiento'
                    : 'Nuevo mantenimiento'}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Completa la información del
                  mantenimiento.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg px-3 py-2 text-xl text-gray-500 transition hover:bg-gray-100"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              {(formError || error) && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {formError || error}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="mantenimiento-moto"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Moto *
                  </label>

                  <select
                    id="mantenimiento-moto"
                    required
                    value={form.moto}
                    onChange={(event) => {
                      handleFormChange(
                        'moto',
                        event.target.value,
                      );
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-600"
                  >
                    <option value="">
                      Selecciona una moto
                    </option>

                    {motos.map((moto) => (
                      <option
                        key={moto.idMoto}
                        value={moto.idMoto}
                      >
                        {getMotoLabel(
                          moto.idMoto,
                        )}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mantenimiento-cliente"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Cliente *
                  </label>

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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-600 disabled:bg-gray-100"
                  >
                    <option value="">
                      {isLoadingUsers
                        ? 'Cargando clientes...'
                        : 'Selecciona un cliente'}
                    </option>

                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                      >
                        {getUserName(user)}
                        {user.email
                          ? ` - ${user.email}`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mantenimiento-servicio"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Servicio *
                  </label>

                  <select
                    id="mantenimiento-servicio"
                    required
                    value={form.servicio}
                    onChange={(event) => {
                      handleServicioChange(
                        event.target.value,
                      );
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-600"
                  >
                    <option value="">
                      Selecciona un servicio
                    </option>

                    {servicios
                      .filter(
                        (servicio) =>
                          servicio.estado ||
                          String(servicio.id) ===
                            form.servicio,
                      )
                      .map((servicio) => (
                        <option
                          key={servicio.id}
                          value={servicio.id}
                        >
                          {servicio.nombre} -{' '}
                          {formatCurrency(
                            Number(
                              servicio.precio_base,
                            ),
                          )}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mantenimiento-kilometraje"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Kilometraje actual *
                  </label>

                  <input
                    id="mantenimiento-kilometraje"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={
                      form.kilometrajeActual
                    }
                    onChange={(event) => {
                      handleFormChange(
                        'kilometrajeActual',
                        event.target.value,
                      );
                    }}
                    placeholder="Ej. 18500"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mantenimiento-costo"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Costo final *
                  </label>

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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mantenimiento-estado"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Estado *
                  </label>

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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-600"
                  >
                    {estados.map((estado) => (
                      <option
                        key={estado}
                        value={estado}
                      >
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="mantenimiento-diagnostico"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Diagnóstico inicial
                  </label>

                  <textarea
                    id="mantenimiento-diagnostico"
                    rows={4}
                    value={
                      form.diagnosticoInicial
                    }
                    onChange={(event) => {
                      handleFormChange(
                        'diagnosticoInicial',
                        event.target.value,
                      );
                    }}
                    placeholder="Describe el diagnóstico inicial de la moto..."
                    className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-600"
                  />
                </div>
              </div>

              <div className="mt-7 flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">
              Eliminar mantenimiento
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              ¿Estás seguro de eliminar el
              mantenimiento{' '}
              <strong>
                #
                {
                  deleteTarget.idMantenimiento
                }
              </strong>
              ? Esta acción no se puede
              deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setDeleteTarget(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  void handleConfirmDelete();
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? 'Eliminando...'
                  : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}