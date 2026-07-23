import { useEffect, useState, useRef } from 'react';
import { useRepuestoStore } from '../../store/repuesto.store';
import { formatDate, formatPrice } from '../../utils/formatters';
import { parseApiError } from '../../../infrastructure/http/api-error';
import { Plus, Edit, Trash2, Loader2, Upload, FileImage, Search } from 'lucide-react';
import type { Repuesto } from '../../../domain/entities/repuesto.entity';

const ORDERING_OPTIONS = [
  { value: 'nombre', label: 'Nombre (A → Z)' },
  { value: '-nombre', label: 'Nombre (Z → A)' },
  { value: 'precio_venta', label: 'Precio venta (menor)' },
  { value: '-precio_venta', label: 'Precio venta (mayor)' },
  { value: 'costo', label: 'Costo (menor)' },
  { value: '-costo', label: 'Costo (mayor)' },
  { value: 'stock', label: 'Stock (menor)' },
  { value: '-stock', label: 'Stock (mayor)' },
] as const;

const ESTADO_OPTIONS = ['Activo', 'Inactivo', 'Disponible', 'Agotado'];

export default function RepuestosAdminPage() {
  const {
    repuestos,
    totalCount,
    isLoading,
    error,
    fetchRepuestos,
    createRepuesto,
    updateRepuesto,
    deleteRepuesto,
  } = useRepuestoStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sku, setSku] = useState('');
  const [costo, setCosto] = useState<number>(0);
  const [precioVenta, setPrecioVenta] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [estado, setEstado] = useState('Activo');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [ordering, setOrdering] = useState<string>('nombre');
  const [page, setPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    const params: { page: number; search?: string; ordering?: string } = { page };
    if (searchTerm) params.search = searchTerm;
    if (ordering) params.ordering = ordering;
    fetchRepuestos(params);
  }, [page, searchTerm, ordering, fetchRepuestos]);

  const reloadList = () => {
    const params: { page: number; search?: string; ordering?: string } = { page };
    if (searchTerm) params.search = searchTerm;
    if (ordering) params.ordering = ordering;
    return fetchRepuestos(params);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormError(null);
    setNombre('');
    setDescripcion('');
    setSku('');
    setCosto(0);
    setPrecioVenta(0);
    setStock(0);
    setEstado('Activo');
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (repuesto: Repuesto) => {
    setEditingId(repuesto.idRepuesto);
    setFormError(null);
    setNombre(repuesto.nombre);
    setDescripcion(repuesto.descripcion || '');
    setSku(repuesto.sku);
    setCosto(repuesto.costo);
    setPrecioVenta(repuesto.precioVenta);
    setStock(repuesto.stock);
    setEstado(repuesto.estado);
    setImageFile(null);
    setImagePreview(repuesto.imagen);
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append('nombre', nombre);
    fd.append('descripcion', descripcion);
    fd.append('sku', sku);
    fd.append('costo', String(costo));
    fd.append('precio_venta', String(precioVenta));
    fd.append('stock', String(stock));
    fd.append('estado', estado);
    if (imageFile) {
      fd.append('imagen', imageFile);
    }
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !sku.trim()) return;

    setFormError(null);
    const fd = buildFormData();

    try {
      if (editingId !== null) {
        await updateRepuesto(editingId, fd);
      } else {
        await createRepuesto(fd);
      }
      setModalOpen(false);
      await reloadList();
    } catch (err: unknown) {
      setFormError(parseApiError(err, 'No se pudo guardar el repuesto.'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este repuesto?')) {
      return;
    }

    try {
      await deleteRepuesto(id);
      await reloadList();
    } catch (err: unknown) {
      setFormError(parseApiError(err, 'No se pudo eliminar el repuesto.'));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRepuestos({
      search: searchTerm || undefined,
      ordering,
      page: 1,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">
            Administrar Repuestos
          </h1>
          <p className="text-neutral-500 dark:text-muted-foreground text-sm">
            Gestiona el catálogo maestro de repuestos y accesorios
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)] self-start cursor-pointer"
        >
          <Plus className="size-4" /> Agregar Repuesto
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 gap-3 bg-card border border-border rounded-full px-5 py-2.5 items-center transition-colors duration-300"
        >
          <Search className="text-neutral-500 size-4 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-card-foreground text-xs placeholder-neutral-500 font-semibold focus:outline-none focus:ring-0 w-full"
          />
          <button
            type="submit"
            className="bg-muted hover:bg-neutral-700 text-foreground rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors"
          >
            Buscar
          </button>
        </form>

        <select
          value={ordering}
          onChange={(e) => {
            setOrdering(e.target.value);
            setPage(1);
          }}
          className="bg-card border border-border text-foreground rounded-full py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary transition-colors"
        >
          {ORDERING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {(error || formError) && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs py-3 px-4 rounded-full text-center font-semibold">
          {error || formError}
        </div>
      )}

      {isLoading && repuestos.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary size-10" />
        </div>
      ) : repuestos.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 border border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">No se encontraron repuestos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repuestos.map((rep) => (
            <div
              key={rep.idRepuesto}
              className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-colors duration-300 flex flex-col group"
            >
              <div className="relative h-48 w-full bg-background overflow-hidden">
                {rep.imagen ? (
                  <img
                    src={rep.imagen}
                    alt={rep.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                    <FileImage className="size-10 stroke-[1.5]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Sin Imagen</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border/50 text-[10px] font-black text-foreground uppercase tracking-wider font-mono">
                  {rep.sku}
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-muted border border-border text-neutral-500">
                  {rep.estado}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-card-foreground uppercase tracking-tight truncate">
                    {rep.nombre}
                  </h3>
                  <p className="text-neutral-500 text-xs font-semibold line-clamp-2 mt-1 min-h-[2rem]">
                    {rep.descripcion || 'Sin descripción'}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Registro: {formatDate(rep.fechaRegistro)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border text-sm">
                  <div>
                    <span className="text-neutral-500 text-[10px] font-bold block uppercase">Costo</span>
                    <span className="font-bold text-card-foreground">{formatPrice(rep.costo)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] font-bold block uppercase">P. Venta</span>
                    <span className="font-black text-primary">{formatPrice(rep.precioVenta)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] font-bold block uppercase">Stock</span>
                    <span className="font-black text-card-foreground">{rep.stock} u.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rep)}
                    className="w-1/2 bg-card hover:bg-neutral-100 dark:hover:bg-muted border border-border text-card-foreground rounded-full py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="size-3.5" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(rep.idRepuesto)}
                    className="w-1/2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded-full py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalCount > pageSize && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-border bg-background text-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer rounded-full"
          >
            Anterior
          </button>
          <span className="text-xs font-bold text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-border bg-background text-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer rounded-full"
          >
            Siguiente
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-6">
              {editingId !== null ? 'Editar Repuesto' : 'Agregar Repuesto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl p-6 bg-background/40 relative group">
                {imagePreview ? (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-foreground font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer"
                    >
                      <Upload className="size-4 mr-1.5 animate-bounce" /> Cambiar Imagen
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 hover:text-foreground text-neutral-500 transition-colors py-4 cursor-pointer"
                  >
                    <Upload className="size-8 stroke-[1.5]" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Cargar Imagen</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-black uppercase tracking-wider">Nombre</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-background border border-border text-foreground rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-black uppercase tracking-wider">SKU</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-background border border-border text-foreground rounded-full py-3.5 px-5 text-xs font-semibold font-mono focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-black uppercase tracking-wider">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-background border border-border text-foreground rounded-[1.5rem] py-3.5 px-5 text-xs font-semibold h-20 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Costo</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={costo}
                    onChange={(e) => setCosto(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Precio venta</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-black uppercase tracking-wider">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full bg-background border border-border text-foreground rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 transition-all"
                >
                  {ESTADO_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-xs text-destructive font-semibold text-center">{formError}</p>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 border border-border text-muted-foreground hover:text-foreground font-black uppercase text-xs tracking-wider rounded-full py-4 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-xs tracking-wider rounded-full py-4 transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)]"
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
