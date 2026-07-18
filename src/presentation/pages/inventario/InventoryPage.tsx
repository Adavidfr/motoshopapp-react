// src/presentation/pages/inventario/InventoryPage.tsx
import { useEffect, useState } from 'react';
import { useInventoryStore } from '../../store/inventory.store';
import { useMotoStore } from '../../store/moto.store';
import { useRepuestoStore } from '../../store/repuesto.store';
import { Plus, Loader2, ArrowUpRight, ArrowDownLeft, User } from 'lucide-react';

export default function InventoryPage() {
  const { movements, isLoading, error, fetchMovements, createMovement } = useInventoryStore();
  const { motos, fetchMotos } = useMotoStore();
  const { repuestos, fetchRepuestos } = useRepuestoStore();

  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [itemType, setItemType] = useState<'moto' | 'repuesto'>('moto');
  const [selectedItemId, setSelectedItemId] = useState<number | string>('');
  const [tipoMovimiento, setTipoMovimiento] = useState('Entrada por Compra');
  const [cantidad, setCantidad] = useState<number>(1);
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    fetchMovements();
    fetchMotos();
    fetchRepuestos();
  }, [fetchMovements, fetchMotos, fetchRepuestos]);

  useEffect(() => {
    // Reset selected item on type change
    if (itemType === 'moto') {
      setSelectedItemId(motos[0]?.idMoto || '');
    } else {
      setSelectedItemId(repuestos[0]?.idRepuesto || '');
    }
  }, [itemType, motos, repuestos]);

  const handleOpenCreate = () => {
    setItemType('moto');
    setSelectedItemId(motos[0]?.idMoto || '');
    setTipoMovimiento('Entrada por Compra');
    setCantidad(1);
    setDescripcion('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;

    const payload: any = {
      cantidad: Number(cantidad),
      tipo_movimiento: tipoMovimiento,
      descripcion: descripcion,
    };

    if (itemType === 'moto') {
      payload.id_moto = Number(selectedItemId);
    } else {
      payload.id_repuesto = Number(selectedItemId);
    }

    try {
      await createMovement(payload);
      setModalOpen(false);
      // Refresh catalog values
      fetchMotos();
      fetchRepuestos();
    } catch (err) {
      // Manejado en el store
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight text-left">Control de Inventario</h1>
          <p className="text-neutral-400 text-sm text-left">Bitácora general de entradas y salidas de almacén (Kardex)</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/95 text-white flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.25)]"
        >
          <Plus className="size-4" /> Registrar Movimiento
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs py-3 px-4 rounded-full text-center font-semibold">
          {error}
        </div>
      )}

      {isLoading && movements.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary size-10" />
        </div>
      ) : (
        <div className="bg-[#0c0c0e] border border-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-950 text-neutral-400 text-xs font-black uppercase tracking-wider">
                  <th className="py-4 px-6">Fecha</th>
                  <th className="py-4 px-6">Artículo</th>
                  <th className="py-4 px-6">Tipo</th>
                  <th className="py-4 px-6 text-center">Cantidad</th>
                  <th className="py-4 px-6">Descripción</th>
                  <th className="py-4 px-6 text-right">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-950 text-sm">
                {movements.map((move) => {
                  const isEntry = move.tipoMovimiento.toLowerCase().includes('entrada') || move.cantidad > 0;
                  return (
                    <tr key={move.idMovimiento} className="hover:bg-neutral-900/20 transition-colors">
                      <td className="py-4 px-6 text-neutral-400 font-medium whitespace-nowrap">
                        {new Date(move.fechaMovimiento).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-white">
                        {move.idMoto ? (
                          <span className="text-primary-foreground">🏍️ {move.motoModelo || `Moto #${move.idMoto}`}</span>
                        ) : (
                          <span className="text-neutral-300">⚙️ {move.repuestoNombre || `Repuesto #${move.idRepuesto}`}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isEntry 
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                            : 'bg-destructive/10 border border-destructive/20 text-destructive'
                        }`}>
                          {isEntry ? <ArrowUpRight className="size-3" /> : <ArrowDownLeft className="size-3" />}
                          {move.tipoMovimiento}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-black text-white">
                        {isEntry ? `+${Math.abs(move.cantidad)}` : `-${Math.abs(move.cantidad)}`}
                      </td>
                      <td className="py-4 px-6 text-neutral-400 max-w-xs truncate">{move.descripcion || 'Sin observaciones'}</td>
                      <td className="py-4 px-6 text-right text-neutral-500 font-bold">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <User className="size-3" /> {move.usuarioNombre || 'Admin'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0c0e] border border-neutral-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 text-left">
              Registrar Movimiento
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* Item Type Switch */}
              <div className="flex border border-neutral-800 rounded-full overflow-hidden p-1 bg-neutral-950">
                <button
                  type="button"
                  onClick={() => setItemType('moto')}
                  className={`w-1/2 py-2.5 text-xs font-black uppercase tracking-wider rounded-full transition-all ${
                    itemType === 'moto' ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Motocicleta
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('repuesto')}
                  className={`w-1/2 py-2.5 text-xs font-black uppercase tracking-wider rounded-full transition-all ${
                    itemType === 'repuesto' ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Repuesto
                </button>
              </div>

              {/* Item Select */}
              <div className="space-y-1">
                <label className="text-neutral-400 text-xs font-black uppercase tracking-wider">
                  Seleccionar {itemType === 'moto' ? 'Motocicleta' : 'Repuesto'}
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 transition-all"
                >
                  {itemType === 'moto' ? (
                    motos.map((m) => (
                      <option key={m.idMoto} value={m.idMoto}>{m.marca} {m.modelo}</option>
                    ))
                  ) : (
                    repuestos.map((r) => (
                      <option key={r.idRepuesto} value={r.idRepuesto}>{r.nombre} (SKU: {r.sku})</option>
                    ))
                  )}
                </select>
              </div>

              {/* Tipo de Movimiento */}
              <div className="space-y-1">
                <label className="text-neutral-400 text-xs font-black uppercase tracking-wider">Tipo de Movimiento</label>
                <select
                  value={tipoMovimiento}
                  onChange={(e) => setTipoMovimiento(e.target.value)}
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 transition-all"
                >
                  <option value="Entrada por Compra">Entrada por Compra</option>
                  <option value="Salida por Venta">Salida por Venta</option>
                  <option value="Ajuste de Inventario">Ajuste de Inventario (Merma/Sobrante)</option>
                </select>
              </div>

              {/* Cantidad */}
              <div className="space-y-1">
                <label className="text-neutral-400 text-xs font-black uppercase tracking-wider">Cantidad (Unidades)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-full py-3.5 px-5 text-xs font-semibold focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              {/* Descripcion */}
              <div className="space-y-1">
                <label className="text-neutral-400 text-xs font-black uppercase tracking-wider">Descripción / Justificación</label>
                <textarea
                  placeholder="Detalles del ajuste o movimiento..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-[#141417] border border-neutral-800 text-white rounded-[1.5rem] py-3.5 px-5 text-xs font-semibold h-20 focus:outline-none focus:border-primary/80 focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
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
                  {isLoading ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
