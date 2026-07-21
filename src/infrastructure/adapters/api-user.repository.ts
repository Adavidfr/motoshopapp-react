import type { UserRepository, PaginatedUsers } from '../../domain/ports/user.repository';
import type { User } from '../../domain/entities/user.entity';
import { httpClient } from '../http/axios-client';

export class ApiUserRepository implements UserRepository {
  private mapUser(data: any): User {
    return {
      id: data.user_id !== undefined ? Number(data.user_id) : (data.id !== undefined ? Number(data.id) : 0),
      username: data.username || '',
      email: data.email || '',
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      isStaff: data.is_staff || false,
      isActive: data.is_active !== undefined ? data.is_active : true,
      dateJoined: data.date_joined || '',
      role: data.role || (data.is_staff ? 'admin' : 'client'),
      numOrders: data.num_orders ? Number(data.num_orders) : 0,
    };
  }

  async listUsers(limit?: number, offset?: number, search?: string): Promise<PaginatedUsers> {
    const params: any = { limit, offset };
    if (search) params.search = search;
    
    // Asumiendo ruta estándar en DRF/Djoser para usuarios
    const response = await httpClient.get('/users/', { params });
    
    return {
      count: response.data.count || (response.data.results ? response.data.results.length : response.data.length),
      next: response.data.next || null,
      previous: response.data.previous || null,
      results: (response.data.results || response.data).map((u: any) => this.mapUser(u)),
    };
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const payload: any = {};
    if (data.isActive !== undefined) payload.is_active = data.isActive;
    if (data.isStaff !== undefined) payload.is_staff = data.isStaff;
    if (data.role !== undefined) payload.role = data.role;
    
    const response = await httpClient.patch(`/users/${id}/`, payload);
    return this.mapUser(response.data);
  }
}
