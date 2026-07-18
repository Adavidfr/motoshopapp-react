// src/presentation/components/StatusBadge.tsx

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim();

  const getStyleAndLabel = (val: string): { style: string; label: string } => {
    switch (val) {
      // Pedido / Orders
      case 'pending':
        return {
          style: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          label: 'Pendiente',
        };
      case 'confirmed':
        return {
          style: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          label: 'Confirmado',
        };
      case 'shipped':
        return {
          style: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
          label: 'Enviado',
        };
      case 'delivered':
        return {
          style: 'bg-green-500/10 text-green-500 border-green-500/20',
          label: 'Entregado',
        };
      case 'cancelled':
        return {
          style: 'bg-red-500/10 text-red-500 border-red-500/20',
          label: 'Cancelado',
        };

      // Venta / Sales
      case 'pendiente':
        return {
          style: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          label: 'Pendiente',
        };
      case 'completada':
        return {
          style: 'bg-green-500/10 text-green-500 border-green-500/20',
          label: 'Completada',
        };
      case 'anulada':
        return {
          style: 'bg-red-500/10 text-red-500 border-red-500/20',
          label: 'Anulada',
        };

      // Financiamiento / Financing
      case 'activo':
        return {
          style: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          label: 'Activo',
        };
      case 'pagado':
        return {
          style: 'bg-green-500/10 text-green-400 border-green-500/20',
          label: 'Pagado',
        };
      case 'vencido':
        return {
          style: 'bg-red-500/10 text-red-400 border-red-500/20',
          label: 'Vencido',
        };
      case 'cancelado':
        return {
          style: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
          label: 'Cancelado',
        };

      default:
        return {
          style: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
          label: status,
        };
    }
  };

  const { style, label } = getStyleAndLabel(normalized);

  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border rounded-full ${style}`}>
      {label}
    </span>
  );
}
