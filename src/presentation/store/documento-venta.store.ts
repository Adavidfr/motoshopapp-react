// src/presentation/store/documento-venta.store.ts
import { create } from 'zustand';
import type { DocumentoVenta, DocumentoVentaCreatePayload } from '../../domain/entities/documento-venta.entity';
import type { DocumentoVentaFilters } from '../../domain/ports/documento-venta.repository';
import {
  getDocumentosUseCase,
  createDocumentoUseCase,
  deleteDocumentoUseCase,
  downloadDocumentoUseCase,
} from '../../infrastructure/factories/documento-venta.factory';
import { parseApiError } from '../../infrastructure/http/api-error';

interface DocumentoState {
  documentos: DocumentoVenta[];
  selectedDocumento: DocumentoVenta | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: DocumentoVentaFilters;
  isLoading: boolean;
  isSaving: boolean;
  isDownloading: boolean;
  error: string | null;
  successMessage: string | null;

  fetchDocumentos: (filters?: DocumentoVentaFilters) => Promise<void>;
  createDocumento: (payload: DocumentoVentaCreatePayload) => Promise<boolean>;
  deleteDocumento: (id: number) => Promise<boolean>;
  downloadDocumento: (id: number, fallbackName?: string) => Promise<boolean>;
  setFilters: (filters: Partial<DocumentoVentaFilters>) => void;
  clearSelectedDocumento: () => void;
  clearMessages: () => void;
}

export const useDocumentoVentaStore = create<DocumentoState>((set, get) => ({
  documentos: [],
  selectedDocumento: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  isDownloading: false,
  error: null,
  successMessage: null,

  fetchDocumentos: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getDocumentosUseCase.execute(f);
      set({
        documentos: r.results,
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

  createDocumento: async (payload) => {
    if (get().isSaving) return false;

    set({ isSaving: true, error: null, successMessage: null });
    try {
      const documento = await createDocumentoUseCase.execute(payload);
      set((state) => ({
        documentos: [documento, ...state.documentos.filter((d) => d.id_documento !== documento.id_documento)],
        count: state.count + (state.documentos.some((d) => d.id_documento === documento.id_documento) ? 0 : 1),
        selectedDocumento: documento,
        successMessage: 'Documento subido con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  deleteDocumento: async (id) => {
    if (get().isSaving) return false;

    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteDocumentoUseCase.execute(id);
      set((state) => ({
        documentos: state.documentos.filter((d) => d.id_documento !== id),
        count: Math.max(0, state.count - 1),
        selectedDocumento: state.selectedDocumento?.id_documento === id ? null : state.selectedDocumento,
        successMessage: 'Documento eliminado con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isSaving: false });
      return false;
    }
  },

  downloadDocumento: async (id, fallbackName) => {
    if (get().isDownloading) return false;

    set({ isDownloading: true, error: null });
    try {
      const { blob, filename } = await downloadDocumentoUseCase.execute(id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename || fallbackName || 'documento';
      anchor.click();
      URL.revokeObjectURL(url);
      set({ isDownloading: false });
      return true;
    } catch (err) {
      set({ error: parseApiError(err), isDownloading: false });
      return false;
    }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedDocumento: () => set({ selectedDocumento: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
