// src/presentation/store/factura.store.ts
import { create } from 'zustand';
import type { Factura, FacturaCreatePayload } from '../../domain/entities/factura.entity';
import type { FacturaFilters } from '../../domain/ports/factura.repository';
import {
  getFacturasUseCase,
  getFacturaUseCase,
  createFacturaUseCase,
  downloadFacturaPdfUseCase,
} from '../../infrastructure/factories/factura.factory';
import { parseApiError } from '../../infrastructure/http/api-error';
import type { AxiosError } from 'axios';

async function blobToErrorMessage(blob: Blob, fallback: string): Promise<string> {
  try {
    const text = await blob.text();
    const parsed = JSON.parse(text) as { detail?: string; error?: string; detalle?: string };
    if (parsed.detail) return String(parsed.detail);
    if (parsed.error) return String(parsed.error);
    if (parsed.detalle) return String(parsed.detalle);
  } catch {
    // no es JSON
  }
  return fallback;
}

async function fetchFacturaPdfBlob(id: number, inline?: boolean): Promise<Blob> {
  try {
    return await downloadFacturaPdfUseCase.execute(id, inline ? { inline: true } : undefined);
  } catch (err) {
    const axiosErr = err as AxiosError<Blob>;
    if (axiosErr.response?.data instanceof Blob) {
      const message = await blobToErrorMessage(
        axiosErr.response.data,
        parseApiError(err, 'No se pudo obtener el PDF de la factura.'),
      );
      throw new Error(message);
    }
    throw err;
  }
}

interface FacturaState {
  facturas: Factura[];
  selectedFactura: Factura | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: FacturaFilters;
  isLoading: boolean;
  isSaving: boolean;
  isDownloadingPdf: boolean;
  error: string | null;
  successMessage: string | null;

  fetchFacturas: (filters?: FacturaFilters) => Promise<void>;
  fetchFacturaById: (id: number) => Promise<void>;
  createFactura: (payload: FacturaCreatePayload) => Promise<Factura | null>;
  downloadFacturaPdf: (id: number, numeroFactura: string) => Promise<boolean>;
  printFacturaPdf: (id: number) => Promise<boolean>;
  pagoTieneFactura: (idPago: number) => boolean;
  setFilters: (filters: Partial<FacturaFilters>) => void;
  clearSelectedFactura: () => void;
  clearMessages: () => void;
}

export const useFacturaStore = create<FacturaState>((set, get) => ({
  facturas: [],
  selectedFactura: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  isDownloadingPdf: false,
  error: null,
  successMessage: null,

  pagoTieneFactura: (idPago) =>
    get().facturas.some((f) => f.id_pago === idPago),

  fetchFacturas: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getFacturasUseCase.execute(f);
      set({
        facturas: r.results,
        count: r.count,
        next: r.next,
        previous: r.previous,
        filters: f,
        isLoading: false,
      });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  fetchFacturaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const factura = await getFacturaUseCase.execute(id);
      set({ selectedFactura: factura, isLoading: false });
    } catch (err) {
      set({ error: parseApiError(err), isLoading: false });
    }
  },

  createFactura: async (payload) => {
    if (get().isSaving) return null;

    if (get().pagoTieneFactura(payload.id_pago)) {
      set({ error: 'Este pago ya tiene una factura emitida.' });
      return null;
    }

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const factura = await createFacturaUseCase.execute(payload);
      set((state) => ({
        facturas: [factura, ...state.facturas.filter((f) => f.id_factura !== factura.id_factura)],
        count: state.count + (state.facturas.some((f) => f.id_factura === factura.id_factura) ? 0 : 1),
        selectedFactura: factura,
        successMessage: `Factura ${factura.numero_factura} emitida con éxito`,
        isSaving: false,
      }));
      return factura;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return null;
    }
  },

  downloadFacturaPdf: async (id, numeroFactura) => {
    if (get().isDownloadingPdf) return false;
    set({ isDownloadingPdf: true, error: null });
    try {
      const blob = await fetchFacturaPdfBlob(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${numeroFactura}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      set({ isDownloadingPdf: false });
      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : parseApiError(err),
        isDownloadingPdf: false,
      });
      return false;
    }
  },

  printFacturaPdf: async (id) => {
    if (get().isDownloadingPdf) return false;
    set({ isDownloadingPdf: true, error: null });
    try {
      const blob = await fetchFacturaPdfBlob(id, true);
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        window.setTimeout(() => {
          iframe.remove();
          URL.revokeObjectURL(url);
        }, 1000);
      };
      set({ isDownloadingPdf: false });
      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : parseApiError(err),
        isDownloadingPdf: false,
      });
      return false;
    }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedFactura: () => set({ selectedFactura: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
