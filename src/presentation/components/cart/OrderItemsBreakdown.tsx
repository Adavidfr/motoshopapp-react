import type { ItemCarrito } from '../../../domain/entities/cart.entity';
import type { PedidoEstado } from '../../../domain/entities/order.entity';
import { useLineItemProducts } from '../../hooks/use-line-item-products';
import { getOrderCompositionFromItems } from '../../utils/order-composition';
import { CartLineItem } from './CartLineItem';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Card, CardContent } from '../ui/card';
import { StatusBadge } from '../StatusBadge';
import { Loader2 } from 'lucide-react';

interface OrderItemsBreakdownProps {
  items: ItemCarrito[];
  total: number;
  usernameCliente?: string;
  fecha?: string;
  estado?: PedidoEstado | string;
  showMeta?: boolean;
  compact?: boolean;
}

function resolveLineItemState(
  item: ItemCarrito,
  lineItemProducts: ReturnType<typeof useLineItemProducts>,
) {
  let moto = null;
  let repuesto = null;
  let isLoadingProduct = false;
  let isProductUnavailable = false;

  if (item.idMoto !== null) {
    moto = lineItemProducts.getMoto(item.idMoto);
    isProductUnavailable = lineItemProducts.isMotoUnavailable(item.idMoto);
    isLoadingProduct = !moto && !isProductUnavailable;
  } else if (item.idRepuesto !== null) {
    repuesto = lineItemProducts.getRepuesto(item.idRepuesto);
    isProductUnavailable = lineItemProducts.isRepuestoUnavailable(item.idRepuesto);
    isLoadingProduct = !repuesto && !isProductUnavailable;
  }

  return { moto, repuesto, isLoadingProduct, isProductUnavailable };
}

export function OrderItemsBreakdown({
  items,
  total,
  usernameCliente,
  fecha,
  estado,
  showMeta = false,
  compact = true,
}: OrderItemsBreakdownProps) {
  const lineItemProducts = useLineItemProducts(items);
  const composition = getOrderCompositionFromItems(items);

  const isAnyLoading =
    items.length > 0 &&
    items.some((item) => resolveLineItemState(item, lineItemProducts).isLoadingProduct);

  return (
    <div className="space-y-4">
      {showMeta && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {usernameCliente && (
            <div>
              <span className="text-muted-foreground">Cliente: </span>
              <span className="font-semibold text-foreground">{usernameCliente}</span>
            </div>
          )}
          {fecha && (
            <div>
              <span className="text-muted-foreground">Fecha: </span>
              <span className="font-medium text-foreground">{formatDate(fecha)}</span>
            </div>
          )}
          {estado && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Estado:</span>
              <StatusBadge status={estado} />
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Contenido: </span>
            <span className="font-semibold text-foreground">{composition.label}</span>
          </div>
        </div>
      )}

      {!showMeta && items.length > 0 && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {composition.label}
        </p>
      )}

      {isAnyLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Loader2 className="size-3.5 animate-spin" />
          Cargando productos...
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Este pedido no tiene ítems registrados.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const { moto, repuesto, isLoadingProduct, isProductUnavailable } =
              resolveLineItemState(item, lineItemProducts);

            return (
              <Card key={item.idItem} className="border-border/40">
                <CardContent className="p-0">
                  <CartLineItem
                    item={item}
                    moto={moto}
                    repuesto={repuesto}
                    isLoadingProduct={isLoadingProduct}
                    isProductUnavailable={isProductUnavailable}
                    readOnly
                    compact={compact}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center border-t border-border/40 pt-3">
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          Total del pedido
        </span>
        <span className="text-lg font-black text-primary">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
