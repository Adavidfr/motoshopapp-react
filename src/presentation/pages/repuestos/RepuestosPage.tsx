import { useEffect, useState, useRef } from 'react';
import { useRepuestoStore } from '../../store/repuesto.store';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import { Plus, Edit, Trash2, Loader2, Upload, FileImage, Search } from 'lucide-react';
import type { Repuesto } from '../../../domain/entities/repuesto.entity';

export default function RepuestosPage() {
  const { repuestos, isLoading, error, fetchRepuestos, createRepuesto, updateRepuesto, deleteRepuesto } = useRepuestoStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  
  const isAdmin = !!(user?.isStaff || user?.role === 'admin'); // Validar privilegios de administrador

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [addingItemId, setAddingItemId] = useState<number | null>(null);
  const [justAddedItemId, setJustAddedItemId] = useState<number | null>(null);

  const handleAddToCart = async (rep: Repuesto) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setAddingItemId(rep.idRepuesto);
    try {
      await addToCart(null, rep.idRepuesto, 1, rep.precioVenta);
      setAddingItemId(null);
      setJustAddedItemId(rep.idRepuesto);
      setSuccessMsg(`¡${rep.nombre} agregado al carrito!`);
      setTimeout(() => {
        setJustAddedItemId(null);
        setSuccessMsg(null);
      }, 3500);
    } catch {
      setAddingItemId(null);
    }
  };

  // Form states
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sku, setSku] = useState('');
  const [costo, setCosto] = useState<number>(0);
  const [precioVenta, setPrecioVenta] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [estado, setEstado] = useState('Activo');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRepuestos();
  }, [fetchRepuestos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRepuestos({ search: searchTerm });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !sku.trim()) return;

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

    try {
      if (editingId !== null) {
        await updateRepuesto(editingId, fd);
      } else {
        await createRepuesto(fd);
      }
      setModalOpen(false);
      fetchRepuestos(); // Refresh
    } catch (err) {
      // Manejado
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este repuesto?')) {
      try {
        await deleteRepuesto(id);
      } catch (err) {
        // Manejado
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight text-left">Galería de Repuestos</h1>
          <p className="text-neutral-400 text-sm text-left">Explora y gestiona piezas de recambio oficiales y accesorios</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)] self-start"
          >
            <Plus className="size-4" /> Agregar Repuesto
          </button>
        )}
      </div>

      {/* Filter and Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 bg-[#0c0c0e] border border-neutral-900 rounded-full px-5 py-2.5 max-w-md items-center">
        <Search className="text-neutral-500 size-4 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por SKU o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-white text-xs placeholder-neutral-500 font-semibold focus:outline-none focus:ring-0 w-full"
        />
        <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors">
          Buscar
        </button>
      </form>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs py-3 px-4 rounded-full text-center font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="fixed bottom-8 right-8 z-50 bg-green-600 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-4 rounded-2xl shadow-[0_10px_35px_rgba(22,163,74,0.35)] animate-in slide-in-from-bottom duration-300 flex items-center gap-2 border border-green-500/20">
          <span className="text-sm">✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading && repuestos.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary size-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {repuestos.map((rep) => (
            <div key={rep.idRepuesto} className="bg-[#0c0c0e] border border-neutral-900/60 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group text-left">
              {/* Image box */}
              <div className="relative h-44 w-full bg-neutral-950 overflow-hidden">
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
                {/* SKU Badge */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800/50 text-[9px] font-black text-white uppercase tracking-wider">
                  SKU: {rep.sku}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex flex-col flex-1 space-y-4">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight truncate">{rep.nombre}</h3>
                  <p className="text-neutral-500 text-xs font-semibold line-clamp-2 mt-1 h-8 leading-relaxed">
                    {rep.descripcion || 'Sin descripción adicional'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-900/60">
                  <div>
                    <span className="text-neutral-500 text-[10px] font-bold block uppercase">Precio</span>
                    <span className="text-base font-black text-white">${rep.precioVenta.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 text-[10px] font-bold block uppercase">Stock</span>
                    <span className="text-sm font-black text-white">{rep.stock} u.</span>
                  </div>
                </div>

                {/* Botón Agregar al Carrito */}
                <button
                  onClick={() => handleAddToCart(rep)}
                  disabled={addingItemId === rep.idRepuesto || justAddedItemId === rep.idRepuesto}
                  className={`w-full text-white rounded-full py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-200 ${
                    justAddedItemId === rep.idRepuesto
                      ? 'bg-green-600 hover:bg-green-600 shadow-[0_4px_15px_rgba(22,163,74,0.25)]'
                      : 'bg-primary hover:bg-primary/95 shadow-[0_4px_15px_rgba(255,26,26,0.15)]'
                  }`}
                >
                  {addingItemId === rep.idRepuesto ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      Agregando...
                    </>
                  ) : justAddedItemId === rep.idRepuesto ? (
                    <>
                      <span>✓</span>
                      ¡Agregado!
                    </>
                  ) : (
                    'Agregar al Carrito'
                  )}
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEdit(rep)}
                      className="w-1/2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white rounded-full py-2 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <Edit className="size-3" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(rep.idRepuesto)}
                      className="w-1/2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded-full py-2 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="size-3" /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c0e] border border-neutral-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">
              {editingId !== null ? 'Editar Repuesto' : 'Agregar Repuesto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* Image Preview & Upload Button */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-800 rounded-3xl p-6 bg-neutral-950/40 relative group">
                {imagePreview ? (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider transition-opacity cursor-pointer"
                    >
                      <Upload className="size-4 mr-1.5 animate-bounce" /> Cambiar Imagen
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 hover:text-white text-neutral-500 transition-colors py-4 cursor-pointer"
                  >
                    <Upload className="size-8 stroke-[1.5]" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Cargar Foto de Repuesto</span>
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

              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-neutral-400 text-xs font-black uppercase tracking-wider">Nombre del Repuesto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pastillas de freno Brembo, Cadena RK 520"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* SKU */}
              <div className="space-y-1">
                <label className="text-neutral-400 text-xs font-black uppercase tracking-wider">SKU Único</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: REP-BREMBO-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Descripcion */}
              <div className="space-y-1">
                <label className="text-neutral-400 text-xs font-black uppercase tracking-wider">Descripción</label>
                <textarea
                  placeholder="Detalles técnicos del repuesto..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-[1.5rem] py-3.5 px-5 text-xs font-semibold h-20 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              {/* Costo, Venta & Stock Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 text-[10px] font-black uppercase tracking-wider">Costo</label>
                  <input
                    type="number"
                    required
                    value={costo}
                    onChange={(e) => setCosto(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400 text-[10px] font-black uppercase tracking-wider">P. Venta</label>
                  <input
                    type="number"
                    required
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400 text-[10px] font-black uppercase tracking-wider">Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 border border-neutral-800 text-neutral-400 hover:text-white font-black uppercase text-xs tracking-wider rounded-full py-4 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 bg-[#ff1a1a] hover:bg-[#e60000] text-white font-black uppercase text-xs tracking-wider rounded-full py-4 transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)]"
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
