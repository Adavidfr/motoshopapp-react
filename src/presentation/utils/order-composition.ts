import type { ItemCarrito } from '../../domain/entities/cart.entity';

export type OrderCompositionType = 'solo-motos' | 'solo-repuestos' | 'mixto' | 'vacio';

export function getOrderCompositionType(items: ItemCarrito[]): OrderCompositionType {
  if (items.length === 0) {
    return 'vacio';
  }

  const hasMoto = items.some((item) => item.idMoto !== null);
  const hasRepuesto = items.some((item) => item.idRepuesto !== null);

  if (hasMoto && hasRepuesto) {
    return 'mixto';
  }
  if (hasMoto) {
    return 'solo-motos';
  }
  if (hasRepuesto) {
    return 'solo-repuestos';
  }

  return 'vacio';
}

export function getOrderCompositionLabel(type: OrderCompositionType): string {
  switch (type) {
    case 'solo-motos':
      return 'Solo motocicletas';
    case 'solo-repuestos':
      return 'Solo repuestos';
    case 'mixto':
      return 'Pedido mixto';
    default:
      return 'Sin ítems';
  }
}

export function getOrderCompositionFromItems(items: ItemCarrito[]): {
  type: OrderCompositionType;
  label: string;
} {
  const type = getOrderCompositionType(items);
  return { type, label: getOrderCompositionLabel(type) };
}
