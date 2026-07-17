// src/presentation/pages/admin/BrandsAdminPage.tsx
import { useEffect, useState } from 'react';
import { useBrandStore } from '../../store/brand.store';
import { Plus, ToggleLeft, ToggleRight, Loader2, Edit } from 'lucide-react';

export default function BrandsAdminPage() {
  const { brands, isLoading, error, fetchBrands, createBrand, updateBrand } = useBrandStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormStatus(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (brand: any) => {
    setEditingId(brand.idMarca);
    setFormName(brand.nombre);
    setFormDesc(brand.descripcion || '');
    setFormStatus(brand.estado);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingId !== null) {
        await updateBrand(editingId, { nombre: formName, descripcion: formDesc, estado: formStatus });
      } else {
        await createBrand({ nombre: formName, descripcion: formDesc, estado: formStatus });
      }
      setModalOpen(false);
    } catch (err) {
      // Manejado en el store
    }
  };

  const handleToggleStatus = async (brand: any) => {
    try {
      await updateBrand(brand.idMarca, { estado: !brand.estado });
    } catch (err) {
      // Manejado
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Administrar Marcas</h1>
          <p className="text-neutral-400 text-sm">Gestiona los fabricantes del inventario de motocicletas</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)]"
        >
          <Plus className="size-4" /> Nueva Marca
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs py-3 px-4 rounded-full text-center font-semibold">
          {error}
        </div>
      )}

      {isLoading && brands.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary size-10" />
        </div>
      ) : (
        <div className="bg-[#0c0c0e] border border-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-950 text-neutral-400 text-xs font-black uppercase tracking-wider">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Nombre</th>
                <th className="py-4 px-6">Descripción</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950 text-sm">
              {brands.map((brand) => (
                <tr key={brand.idMarca} className="hover:bg-neutral-900/20 transition-colors">
                  <td className="py-4 px-6 font-bold text-neutral-500">#{brand.idMarca}</td>
                  <td className="py-4 px-6 font-bold text-white">{brand.nombre}</td>
                  <td className="py-4 px-6 text-neutral-400 max-w-xs truncate">{brand.descripcion || 'Sin descripción'}</td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => handleToggleStatus(brand)} className="focus:outline-none">
                      {brand.estado ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-neutral-500 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Inactivo
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(brand)}
                      className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-all"
                    >
                      <Edit className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0e] border border-neutral-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">
              {editingId !== null ? 'Editar Marca' : 'Nueva Marca'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-neutral-400 text-xs font-black uppercase tracking-wider">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Yamaha, Ducati"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3 px-5 text-sm font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 text-xs font-black uppercase tracking-wider">Descripción</label>
                <textarea
                  placeholder="Detalles sobre la marca fabricante..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-[1.5rem] py-3 px-5 text-sm font-semibold h-24 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between bg-[#141417] border border-neutral-800/60 rounded-full px-5 py-3">
                <span className="text-xs font-black text-white uppercase tracking-wider">Estado Activo</span>
                <button
                  type="button"
                  onClick={() => setFormStatus(!formStatus)}
                  className="text-neutral-400 hover:text-white transition-colors focus:outline-none"
                >
                  {formStatus ? (
                    <ToggleRight className="size-8 text-primary" />
                  ) : (
                    <ToggleLeft className="size-8 text-neutral-600" />
                  )}
                </button>
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
