// src/presentation/components/CatalogFiltersPanel.tsx
import { Search, X } from 'lucide-react';

export interface CatalogFilterOption {
  value: string | number;
  label: string;
}

interface CatalogFiltersPanelProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedBrand: string;
  onBrandChange: (value: string) => void;
  selectedOrder: string;
  onOrderChange: (value: string) => void;
  categories: CatalogFilterOption[];
  brands: CatalogFilterOption[];
  orderOptions?: CatalogFilterOption[];
  onClear?: () => void;
  hasFilters?: boolean;
  className?: string;
}

const DEFAULT_ORDER: CatalogFilterOption[] = [
  { value: '', label: 'Relevancia' },
  { value: 'precio', label: 'Precio: menor a mayor' },
  { value: '-precio', label: 'Precio: mayor a menor' },
  { value: 'modelo', label: 'Modelo A-Z' },
  { value: '-anio', label: 'Año más reciente' },
];

/**
 * Barra horizontal de filtros (sin sidebar / sin títulos "Filtros").
 */
export default function CatalogFiltersPanel({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  selectedOrder,
  onOrderChange,
  categories,
  brands,
  orderOptions = DEFAULT_ORDER,
  onClear,
  hasFilters = false,
  className = '',
}: CatalogFiltersPanelProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative border border-white/[0.08] bg-white/[0.02]">
        {/* Acento rojo superior */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary via-primary/40 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {/* Buscador */}
          <div className="xl:col-span-4 flex items-center gap-3 px-4 sm:px-5 h-14">
            <Search className="size-4 text-white/40 shrink-0" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar modelo..."
              className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder:text-white/35 h-full"
              aria-label="Buscar modelo"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-white/40 hover:text-white transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <InlineSelect
            className="xl:col-span-2"
            ariaLabel="Categoría"
            value={selectedCategory}
            onChange={onCategoryChange}
            options={[{ value: '', label: 'Categoría' }, ...categories]}
          />
          <InlineSelect
            className="xl:col-span-2"
            ariaLabel="Marca"
            value={selectedBrand}
            onChange={onBrandChange}
            options={[{ value: '', label: 'Marca' }, ...brands]}
          />
          <InlineSelect
            className="xl:col-span-3"
            ariaLabel="Ordenar por"
            value={selectedOrder}
            onChange={onOrderChange}
            options={orderOptions.map((o) =>
              o.value === '' ? { ...o, label: 'Ordenar' } : o,
            )}
          />

          <div className="xl:col-span-1 flex items-center justify-center px-3 h-14">
            {hasFilters && onClear ? (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-medium uppercase tracking-wider text-white/45 hover:text-primary transition-colors"
              >
                Limpiar
              </button>
            ) : (
              <span className="text-xs text-white/20 uppercase tracking-wider">—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: CatalogFilterOption[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div className={`relative flex items-center h-14 px-4 ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-full appearance-none bg-transparent text-sm text-white outline-none cursor-pointer pr-6 h-full"
      >
        {options.map((opt) => (
          <option key={`${ariaLabel}-${opt.value}`} value={opt.value} className="bg-[#0e0e0e] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 text-white/35 text-xs">▾</span>
    </div>
  );
}
