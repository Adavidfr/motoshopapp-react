import type { User } from '../../domain/entities/user.entity';

/**
 * Carrito comercial solo para clientes (is_staff=false).
 * Alineado con IsClientWriteOrStaffReadOnly en Django.
 *
 * Futuro RepuestoDetailPage debe usar la misma regla:
 * const canUseCart = isAuthenticated && user?.isStaff !== true;
 */
export function canUseCart(isAuthenticated: boolean, user: User | null): boolean {
  return isAuthenticated && user?.isStaff !== true;
}
