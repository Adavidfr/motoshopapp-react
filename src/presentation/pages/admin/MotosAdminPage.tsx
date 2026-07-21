// src/presentation/pages/admin/MotosAdminPage.tsx
import { useEffect, useState, useRef } from 'react';
import { useMotoStore } from '../../store/moto.store';
import { useBrandStore } from '../../store/brand.store';
import { useCategoryStore } from '../../store/category.store';
import { Plus, Edit, Trash2, Loader2, Upload, FileImage, Search } from 'lucide-react';
import type { Moto } from '../../../domain/entities/moto.entity';

export default function MotosAdminPage() {
  const { motos, totalCount, isLoading, error, fetchMotos, createMoto, updateMoto, deleteMoto } = useMotoStore();
  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [cilindraje, setCilindraje] = useState<number>(250);
  const [color, setColor] = useState('');
  const [precio, setPrecio] = useState<number>(0);
  const [stock, setStock] = useState<number>(1);
  const [status, setStatus] = useState('Disponible');
  const [selectedBrand, setSelectedBrand] = useState<number | string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load auxiliary data once
  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  // Load motos on filters/page change
  useEffect(() => {
    const params: any = { page };
    if (searchTerm) params.search = searchTerm;
    fetchMotos(params);
  }, [page, searchTerm, fetchMotos]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setModelo('');
    setAnio(new Date().getFullYear());
    setCilindraje(250);
    setColor('');
    setPrecio(0);
    setStock(1);
    setStatus('Disponible');
    setSelectedBrand(brands[0]?.idMarca || '');
    setSelectedCategory(categories[0]?.idCategoria || '');
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (moto: Moto) => {
    // Find matching brand & category IDs from names (since getNestedName returns string names)
    const brandObj = brands.find((b) => b.nombre === moto.marca);
    const catObj = categories.find((c) => c.nombre === moto.categoria);

    setEditingId(moto.idMoto);
    setModelo(moto.modelo);
    setAnio(moto.anio);
    setCilindraje(moto.cilindraje);
    setColor(moto.color);
    setPrecio(moto.precio);
    setStock(moto.stock);
    setStatus(moto.estado);
    setSelectedBrand(brandObj?.idMarca || '');
    setSelectedCategory(catObj?.idCategoria || '');
    setImageFile(null);
    setImagePreview(moto.imagen);
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
    if (!modelo.trim() || !selectedBrand || !selectedCategory) return;

    const fd = new FormData();
    fd.append('modelo', modelo);
    fd.append('anio', String(anio));
    fd.append('cilindraje', String(cilindraje));
    fd.append('color', color);
    fd.append('precio', String(precio));
    fd.append('stock', String(stock));
    fd.append('estado', status);
    fd.append('id_marca', String(selectedBrand));
    fd.append('id_categoria', String(selectedCategory));
    
    if (imageFile) {
      fd.append('imagen', imageFile);
    }

    try {
      if (editingId !== null) {
        await updateMoto(editingId, fd);
      } else {
        await createMoto(fd);
      }
      setModalOpen(false);
      fetchMotos(); // Refresh catalog
    } catch (err) {
      // Manejado en el store
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta motocicleta?')) {
      try {
        await deleteMoto(id);
      } catch (err) {
        // Manejado
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMotos({ search: searchTerm, page: 1 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Administrar Motos</h1>
          <p className="text-neutral-500 dark:text-muted-foreground text-sm">Gestiona el inventario de motocicletas del catálogo</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)] self-start cursor-pointer"
        >
          <Plus className="size-4" /> Agregar Motocicleta
        </button>
      </div>

      {/* Filter and Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 bg-card border border-border rounded-full px-5 py-2.5 max-w-md items-center transition-colors duration-300">
        <Search className="text-neutral-500 size-4 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-card-foreground text-xs placeholder-neutral-500 font-semibold focus:outline-none focus:ring-0 w-full"
        />
        <button type="submit" className="bg-muted hover:bg-neutral-700 text-foreground rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors">
          Buscar
        </button>
      </form>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs py-3 px-4 rounded-full text-center font-semibold">
          {error}
        </div>
      )}

      {isLoading && motos.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary size-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {motos.map((moto) => (
            <div key={moto.idMoto} className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-colors duration-300 flex flex-col group">
              {/* Product Image */}
              <div className="relative h-48 w-full bg-background overflow-hidden">
                {moto.imagen ? (
                  <img
                    src={moto.imagen}
                    alt={`${moto.marca} ${moto.modelo}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                    <FileImage className="size-10 stroke-[1.5]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Sin Imagen</span>
                  </div>
                )}
                {/* Brand Badge */}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full border border-border/50 text-[10px] font-black text-foreground uppercase tracking-wider">
                  {moto.marca}
                </div>
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  moto.estado === 'Disponible' 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                    : moto.estado === 'Reservada'
                    ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                    : 'bg-muted border border-border text-neutral-500'
                }`}>
                  {moto.estado}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex flex-col flex-1 space-y-4">
                <div>
                  <span className="text-[10px] text-primary font-black uppercase tracking-wider">{moto.categoria}</span>
                  <h3 className="text-lg font-black text-card-foreground uppercase tracking-tight truncate">{moto.modelo}</h3>
                  <p className="text-neutral-500 text-xs font-semibold">Año {moto.anio} • {moto.cilindraje}cc • {moto.color}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <span className="text-neutral-500 text-[10px] font-bold block uppercase">Precio</span>
                    <span className="text-base font-black text-card-foreground">${moto.precio.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 text-[10px] font-bold block uppercase">Stock</span>
                    <span className="text-sm font-black text-card-foreground">{moto.stock} u.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleOpenEdit(moto)}
                    className="w-1/2 bg-card hover:bg-neutral-100 dark:hover:bg-muted border border-border text-card-foreground rounded-full py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="size-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(moto.idMoto)}
                    className="w-1/2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded-full py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="size-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalCount > 10 && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-border">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-border bg-background text-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer rounded-full"
          >
            Anterior
          </button>
          <span className="text-xs font-bold text-muted-foreground">
            Página {page} de {Math.ceil(totalCount / 10)}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(Math.ceil(totalCount / 10), p + 1))}
            disabled={page >= Math.ceil(totalCount / 10)}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-border bg-background text-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer rounded-full"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-6">
              {editingId !== null ? 'Editar Motocicleta' : 'Agregar Motocicleta'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Image Preview & Upload Button */}
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
                    <span className="text-[10px] font-black uppercase tracking-wider">Cargar Foto de la Moto</span>
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

              {/* Modelo */}
              <div className="space-y-1">
                <label className="text-muted-foreground text-xs font-black uppercase tracking-wider">Modelo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CBR 1000RR Fireblade, Monster 821"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full bg-background border border-border text-foreground rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Marca & Categoria Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-black uppercase tracking-wider">Marca</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 transition-all"
                  >
                    {brands.filter(b => b.estado).map((b) => (
                      <option key={b.idMarca} value={b.idMarca}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-black uppercase tracking-wider">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 transition-all"
                  >
                    {categories.filter(c => c.estado).map((c) => (
                      <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Año, Cilindraje & Color Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Año</label>
                  <input
                    type="number"
                    required
                    value={anio}
                    onChange={(e) => setAnio(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Cilindraje</label>
                  <input
                    type="number"
                    required
                    value={cilindraje}
                    onChange={(e) => setCilindraje(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Color</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Rojo"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Precio, Stock & Estado Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Precio</label>
                  <input
                    type="number"
                    required
                    value={precio}
                    onChange={(e) => setPrecio(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-background border border-border text-foreground rounded-full py-3.5 px-4 text-xs font-semibold focus:outline-none focus:border-primary/80 transition-all"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Reservada">Reservada</option>
                    <option value="Vendida">Vendida</option>
                  </select>
                </div>
              </div>

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
