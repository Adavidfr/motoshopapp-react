import type { ItemCarrito } from '../../../domain/entities/cart.entity';
import type { Moto } from '../../../domain/entities/moto.entity';
import type { Repuesto } from '../../../domain/entities/repuesto.entity';
import { formatPrice } from '../../utils/formatters';
import { Skeleton } from '../ui/skeleton';
import { Trash2, Bike, Cog } from 'lucide-react';

interface CartLineItemProps {
  item: ItemCarrito;
  moto?: Moto | null;
  repuesto?: Repuesto | null;
  isLoadingProduct?: boolean;
  isProductUnavailable?: boolean;
  readOnly?: boolean;
  onRemove?: () => void;
  removeDisabled?: boolean;
  compact?: boolean;
}

function ProductBadge({ label, variant }: { label: string; variant: 'moto' | 'repuesto' }) {
  const classes =
    variant === 'moto'
      ? 'bg-primary/10 text-primary border-primary/25'
      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';

  return (
    <span
      className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${classes}`}
    >
      {label}
    </span>
  );
}

function ProductImage({
  imageUrl,
  alt,
  variant,
  compact,
}: {
  imageUrl: string | null;
  alt: string;
  variant: 'moto' | 'repuesto';
  compact?: boolean;
}) {
  const sizeClass = compact ? 'size-10 rounded-xl' : 'size-16 rounded-2xl';

  return (
    <div
      className={`${sizeClass} bg-primary/[0.08] border border-primary/[0.12] flex items-center justify-center shrink-0 overflow-hidden`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="w-full h-full object-cover" />
      ) : variant === 'moto' ? (
        <Bike className={`${compact ? 'size-4' : 'size-6'} text-primary/70`} />
      ) : (
        <Cog className={`${compact ? 'size-4' : 'size-6'} text-amber-500/70`} />
      )}
    </div>
  );
}

export function CartLineItem({
  item,
  moto = null,
  repuesto = null,
  isLoadingProduct = false,
  isProductUnavailable = false,
  readOnly = false,
  onRemove,
  removeDisabled = false,
  compact = false,
}: CartLineItemProps) {
  const isMotoLine = item.idMoto !== null;
  const isRepuestoLine = item.idRepuesto !== null;

  const renderTitle = () => {
    if (isLoadingProduct) {
      return compact ? (
        <Skeleton className="h-4 w-32" />
      ) : (
        <p className="text-sm text-muted-foreground font-medium">Cargando producto...</p>
      );
    }

    if (isProductUnavailable) {
      return (
        <h3 className={`font-bold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
          Producto no disponible
        </h3>
      );
    }

    if (isMotoLine && moto) {
      return (
        <h3 className={`font-bold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
          {moto.marca} {moto.modelo}
        </h3>
      );
    }

    if (isRepuestoLine && repuesto) {
      return (
        <h3 className={`font-bold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
          {repuesto.nombre}
        </h3>
      );
    }

    return (
      <h3 className={`font-bold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
        Producto no disponible
      </h3>
    );
  };

  const renderSubtitle = () => {
    if (isLoadingProduct || isProductUnavailable) {
      return null;
    }

    if (isMotoLine && moto) {
      return (
        <p className="text-xs text-muted-foreground font-medium">
          {moto.anio} · {moto.cilindraje} cc
        </p>
      );
    }

    if (isRepuestoLine && repuesto) {
      return (
        <p className="text-xs text-muted-foreground font-mono font-medium">SKU: {repuesto.sku}</p>
      );
    }

    return null;
  };

  const imageUrl = isMotoLine ? (moto?.imagen ?? null) : isRepuestoLine ? (repuesto?.imagen ?? null) : null;
  const imageAlt = isMotoLine
    ? moto ? `${moto.marca} ${moto.modelo}` : 'Motocicleta'
    : repuesto?.nombre ?? 'Repuesto';
  const variant = isMotoLine ? 'moto' : 'repuesto';

  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        compact ? '' : 'p-5 sm:p-6'
      }`}
    >
      <div className="flex gap-4 items-center min-w-0 flex-1">
        <ProductImage
          imageUrl={isLoadingProduct ? null : imageUrl}
          alt={imageAlt}
          variant={variant}
          compact={compact}
        />

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isMotoLine && <ProductBadge label="Motocicleta" variant="moto" />}
            {isRepuestoLine && <ProductBadge label="Repuesto" variant="repuesto" />}
          </div>

          {renderTitle()}
          {renderSubtitle()}

          <p className={`text-sm text-muted-foreground font-medium ${compact ? 'text-xs' : ''}`}>
            Precio unitario:{' '}
            <span className="text-foreground">{formatPrice(item.precioUnitario)}</span>
          </p>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Cantidad
            </span>
            <span className="text-xs font-black text-foreground bg-black/5 dark:bg-white/[0.05] border border-black/10 dark:border-white/[0.08] rounded-lg px-2 py-0.5">
              {item.cantidad}
            </span>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 ${
          compact ? '' : 'border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40'
        }`}
      >
        <span className={`font-black text-primary ${compact ? 'text-sm' : 'text-xl'}`}>
          {formatPrice(item.subtotal)}
        </span>

        {!readOnly && onRemove && (
          <button
            onClick={onRemove}
            disabled={removeDisabled}
            className="size-9 rounded-xl border border-border/50 flex items-center justify-center text-neutral-500 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/[0.06] transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            type="button"
            aria-label="Eliminar del carrito"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
