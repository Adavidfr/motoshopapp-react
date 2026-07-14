// src/domain/entities/cart.entity.ts

export type CarritoEstado = 'activo' | 'procesado' | 'abandonado';

export interface ItemCarrito {
  idItem: number;
  idCarrito: number;
  idMoto: number | null;
  idRepuesto: number | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CarritoCompras {
  idCarrito: number;
  usernameCliente: string;
  idUsuarioCliente: number;
  estado: CarritoEstado;
  fechaCreacion: string;
  numItems: number;
  total: number;
  items: ItemCarrito[];
}
