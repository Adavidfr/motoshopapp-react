export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  estado: boolean;
}

export interface ProveedorStats {
  total: number;
  activos: number;
  inactivos: number;
  detail: Proveedor[];
}

export interface PaginatedProveedores {
  count: number;
  next: string | null;
  previous: string | null;
  results: Proveedor[];
}