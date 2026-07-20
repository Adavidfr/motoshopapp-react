// src/presentation/store/documento-venta.store.ts
import { create } from 'zustand';
import type { DocumentoVenta } from '../../domain/entities/documento-venta.entity';
import type { DocumentoVentaFilters } from '../../domain/ports/documento-venta.repository';
import {
  getDocumentosUseCase,
  getDocumentoUseCase,
  createDocumentoUseCase,
  updateDocumentoUseCase,
  deleteDocumentoUseCase,
} from '../../infrastructure/factories/documento-venta.factory';

interface DocumentoState {
  documentos: DocumentoVenta[];
  selectedDocumento: DocumentoVenta | null;
  count: number;
  next: string | null;
  previous: string | null;
  filters: DocumentoVentaFilters;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  fetchDocumentos: (filters?: DocumentoVentaFilters) => Promise<void>;
  fetchDocumentoById: (id: number) => Promise<void>;
  createDocumento: (payload: Omit<DocumentoVenta, 'id_documento' | 'fecha_subida'>) => Promise<boolean>;
  updateDocumento: (id: number, payload: Partial<DocumentoVenta>) => Promise<boolean>;
  deleteDocumento: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<DocumentoVentaFilters>) => void;
  clearSelectedDocumento: () => void;
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

export const useDocumentoVentaStore = create<DocumentoState>((set, get) => ({
  documentos: [],
  selectedDocumento: null,
  count: 0,
  next: null,
  previous: null,
  filters: { page: 1, pageSize: 10 },
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchDocumentos: async (filters) => {
    set({ isLoading: true, error: null });
    const f = { ...get().filters, ...filters };
    try {
      const r = await getDocumentosUseCase.execute(f);
      set({ documentos: r.results, count: r.count, next: r.next, previous: r.previous, filters: f, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  fetchDocumentoById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const d = await getDocumentoUseCase.execute(id);
      set({ selectedDocumento: d, isLoading: false });
    } catch (err) { set({ error: getErr(err), isLoading: false }); }
  },

  createDocumento: async (payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await createDocumentoUseCase.execute(payload);
      set({ successMessage: 'Documento registrado con éxito', isSaving: false });
      get().fetchDocumentos();
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  updateDocumento: async (id, payload) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await updateDocumentoUseCase.execute(id, payload);
      set((s) => ({
        documentos: s.documentos.map((d) => (d.id_documento === id ? updated : d)),
        selectedDocumento: s.selectedDocumento?.id_documento === id ? updated : s.selectedDocumento,
        successMessage: 'Documento actualizado con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  deleteDocumento: async (id) => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      await deleteDocumentoUseCase.execute(id);
      set((s) => ({
        documentos: s.documentos.filter((d) => d.id_documento !== id),
        selectedDocumento: s.selectedDocumento?.id_documento === id ? null : s.selectedDocumento,
        successMessage: 'Documento eliminado con éxito',
        isSaving: false,
      }));
      return true;
    } catch (err) { set({ error: getErr(err), isSaving: false }); return false; }
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearSelectedDocumento: () => set({ selectedDocumento: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
