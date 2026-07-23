// src/presentation/store/venta.store.ts
import { create } from 'zustand';
import type {
  Venta,
  VentaStats,
  VentaEstado,
  VentaCreatePayload,
  VentaResumen,
  VentaUpdatePayload,
} from '../../domain/entities/venta.entity';
import type { VentaFilters } from '../../domain/ports/venta.repository';
import type { FinanciamientoCreatePayload } from '../../domain/entities/financiamiento.entity';
import {
  createVentaUseCase,
  getVentasUseCase,
  getVentaUseCase,
  updateVentaUseCase,
  deleteVentaUseCase,
  getVentaStatsUseCase,
  financiarVentaUseCase,
  getVentaResumenUseCase,
} from '../../infrastructure/factories/venta.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

interface VentaState {
  ventas: Venta[];
  selectedVenta: Venta | null;
  ventaResumen: VentaResumen | null;
  stats: VentaStats | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: VentaFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchVentas: (filters?: VentaFilters) => Promise<void>;
  fetchVentaById: (id: number) => Promise<void>;
  fetchVentaResumen: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createVenta: (payload: VentaCreatePayload) => Promise<boolean>;
  updateVentaStatus: (id: number, status: VentaEstado, observacion?: string) => Promise<boolean>;
  deleteVenta: (id: number) => Promise<boolean>;
  financiarVenta: (id: number, payload: FinanciamientoCreatePayload) => Promise<boolean>;
  setFilters: (filters: Partial<VentaFilters>) => void;
  clearSelectedVenta: () => void;
  clearMessages: () => void;
  pedidoTieneVenta: (idPedido: number) => boolean;
}

export const useVentaStore = create<VentaState>((set, get) => ({
  ventas: [],
  selectedVenta: null,
  ventaResumen: null,
  stats: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  pedidoTieneVenta: (idPedido) =>
    get().ventas.some((v) => v.id_pedido === idPedido),

  fetchVentas: async (filters) => {
    set({ isLoading: true, error: null });
    const currentFilters = { ...get().filters, ...filters };
    try {
      const result = await getVentasUseCase.execute(currentFilters);
      set({
        ventas: result.results,
        count: result.count,
        next: result.next,
        previous: result.previous,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  fetchVentaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const venta = await getVentaUseCase.execute(id);
      set({ selectedVenta: venta, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  fetchVentaResumen: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const resumen = await getVentaResumenUseCase.execute(id);
      set({ ventaResumen: resumen, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await getVentaStatsUseCase.execute();
      set({ stats });
    } catch (err) {
      console.error('Error fetching venta stats:', err);
    }
  },

  createVenta: async (payload) => {
    if (get().isSaving) return false;

    if (get().pedidoTieneVenta(payload.id_pedido)) {
      set({ error: 'Ya existe una venta registrada para este pedido.' });
      return false;
    }

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const venta = await createVentaUseCase.execute(payload);
      set((state) => ({
        ventas: [venta, ...state.ventas.filter((v) => v.id_venta !== venta.id_venta)],
        count: state.count + (state.ventas.some((v) => v.id_venta === venta.id_venta) ? 0 : 1),
        selectedVenta: venta,
        successMessage: 'Venta registrada con éxito. El inventario fue actualizado por el servidor.',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  updateVentaStatus: async (id, status, observacion) => {
    if (get().isSaving) return false;

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updatePayload: VentaUpdatePayload = { estado: status };
      if (observacion) updatePayload.observacion = observacion;

      const updated = await updateVentaUseCase.execute(id, updatePayload);
      set((state) => ({
        ventas: state.ventas.map((v) => (v.id_venta === id ? updated : v)),
        selectedVenta: state.selectedVenta?.id_venta === id ? updated : state.selectedVenta,
        successMessage: 'Estado de venta actualizado',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  deleteVenta: async (id) => {
    if (get().isSaving) return false;

    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteVentaUseCase.execute(id);
      set((state) => ({
        ventas: state.ventas.filter((v) => v.id_venta !== id),
        selectedVenta: state.selectedVenta?.id_venta === id ? null : state.selectedVenta,
        successMessage: 'Venta eliminada con éxito',
        isSaving: false,
      }));
      get().fetchStats();
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  financiarVenta: async (id, payload) => {
    if (get().isSaving) return false;

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const newFin = await financiarVentaUseCase.execute(id, payload);
      set((state) => {
        const updateVentaInList = (v: Venta): Venta => ({
          ...v,
          num_financiamientos: v.num_financiamientos + 1,
          financiamientos: [...(v.financiamientos || []), {
            id_financiamiento: newFin.id_financiamiento,
            entidad_financiera: newFin.entidad_financiera,
            monto_financiado: newFin.monto_financiado,
            estado: newFin.estado,
          }],
        });

        return {
          ventas: state.ventas.map((v) => (v.id_venta === id ? updateVentaInList(v) : v)),
          selectedVenta: state.selectedVenta?.id_venta === id
            ? updateVentaInList(state.selectedVenta)
            : state.selectedVenta,
          successMessage: 'Financiamiento agregado con éxito',
          isSaving: false,
        };
      });
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  clearSelectedVenta: () => set({ selectedVenta: null, ventaResumen: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
