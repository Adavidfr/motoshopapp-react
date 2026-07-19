// src/presentation/store/notificacion.store.ts
import { create } from 'zustand';
import type { Notificacion } from '../../domain/entities/notificacion.entity';
import type { NotificacionFilters, EnviarMasivoPayload } from '../../domain/ports/notificacion.repository';
import {
  getNotificacionesUseCase,
  getNotificacionUseCase,
  createNotificacionUseCase,
  updateNotificacionUseCase,
  deleteNotificacionUseCase,
  marcarLeidaUseCase,
  marcarTodasLeidasUseCase,
  enviarMasivoUseCase,
} from '../../infrastructure/factories/notificacion.factory';

interface NotificacionState {
  notificaciones: Notificacion[];
  selectedNotificacion: Notificacion | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: NotificacionFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchNotificaciones: (filters?: NotificacionFilters) => Promise<void>;
  fetchNotificacionById: (id: number) => Promise<void>;
  createNotificacion: (payload: Omit<Notificacion, 'id_notificacion' | 'leido' | 'fecha_creacion'>) => Promise<boolean>;
  updateNotificacion: (id: number, payload: Partial<Notificacion>) => Promise<boolean>;
  deleteNotificacion: (id: number) => Promise<boolean>;
  marcarLeida: (id: number) => Promise<boolean>;
  marcarTodasLeidas: () => Promise<boolean>;
  enviarMasivo: (payload: EnviarMasivoPayload) => Promise<boolean>;

  setFilters: (filters: Partial<NotificacionFilters>) => void;
  clearSelectedNotificacion: () => void;
  clearMessages: () => void;
}

const getErr = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const e = error as any;
    const d = e.response?.data;
    if (typeof d === 'string') return d;
    if (d && typeof d === 'object') {
      if (d.error) return String(d.error);
      if (d.detail) return String(d.detail);
      const k = Object.keys(d);
      if (k.length > 0) { const v = d[k[0]]; return Array.isArray(v) ? String(v[0]) : String(v); }
    }
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
};

export const useNotificacionStore = create<NotificacionState>((set, get) => ({
  notificaciones: [],
  selectedNotificacion: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchNotificaciones: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getNotificacionesUseCase.execute(f);
      set({ notificaciones: r.results, count: r.count, next: r.next, previous: r.previous, filters: f, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  fetchNotificacionById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const n = await getNotificacionUseCase.execute(id);
      set({ selectedNotificacion: n, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  createNotificacion: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await createNotificacionUseCase.execute(payload);
      set({ successMessage: 'Notificación creada con éxito', isSaving: false });
      get().fetchNotificaciones();
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  updateNotificacion: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateNotificacionUseCase.execute(id, payload);
      set((s) => ({
        notificaciones: s.notificaciones.map((n) => (n.id_notificacion === id ? updated : n)),
        selectedNotificacion: s.selectedNotificacion?.id_notificacion === id ? updated : s.selectedNotificacion,
        successMessage: 'Notificación actualizada con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  deleteNotificacion: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteNotificacionUseCase.execute(id);
      set((s) => ({
        notificaciones: s.notificaciones.filter((n) => n.id_notificacion !== id),
        selectedNotificacion: s.selectedNotificacion?.id_notificacion === id ? null : s.selectedNotificacion,
        successMessage: 'Notificación eliminada con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  marcarLeida: async (id) => {
    set({ error: null });
    try {
      await marcarLeidaUseCase.execute(id);
      set((s) => ({
        notificaciones: s.notificaciones.map((n) => (n.id_notificacion === id ? { ...n, leido: true } : n)),
      }));
      return true;
    } catch (err) { set({ error: getErr(err) }); return false; }
  },

  marcarTodasLeidas: async () => {
    set({ error: null });
    try {
      await marcarTodasLeidasUseCase.execute();
      set((s) => ({
        notificaciones: s.notificaciones.map((n) => ({ ...n, leido: true })),
        successMessage: 'Todas las notificaciones marcadas como leídas',
      }));
      return true;
    } catch (err) { set({ error: getErr(err) }); return false; }
  },

  enviarMasivo: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await enviarMasivoUseCase.execute(payload);
      set({ successMessage: 'Correos masivos enviados con éxito', isSaving: false });
      get().fetchNotificaciones();
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedNotificacion: () => set({ selectedNotificacion: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
