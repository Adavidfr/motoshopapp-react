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
    if (data.firstName !== undefined) payload.first_name = data.firstName;
    if (data.lastName !== undefined) payload.last_name = data.lastName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.username !== undefined) payload.username = data.username;
    
    const response = await httpClient.patch(`/users/${id}/`, payload);
    return this.mapUser(response.data);
  }

  async createUser(data: Partial<User> & { password?: string, passwordConfirm?: string }): Promise<User> {
    // 1. Crear el usuario base usando el endpoint de registro público
    const registerPayload = {
      username: data.username,
      email: data.email,
      password: data.password,
      password2: data.passwordConfirm || data.password,
      role: data.role || 'usuario',
    };
    
    const registerResponse = await httpClient.post('/auth/register/', registerPayload);
    const userId = registerResponse.data.user_id;

    // 2. Hacer PATCH al endpoint de administrador para agregar detalles adicionales (is_staff, is_active, nombres)
    const patchPayload: any = {};
    if (data.firstName !== undefined) patchPayload.first_name = data.firstName;
    if (data.lastName !== undefined) patchPayload.last_name = data.lastName;
    if (data.isStaff !== undefined) patchPayload.is_staff = data.isStaff;
    if (data.isActive !== undefined) patchPayload.is_active = data.isActive;

    if (Object.keys(patchPayload).length > 0) {
      const patchResponse = await httpClient.patch(`/users/${userId}/`, patchPayload);
      return this.mapUser(patchResponse.data);
    }
    
    // Si no hubo PATCH, hacemos un GET para retornar el usuario mapeado completamente
    const getResponse = await httpClient.get(`/users/${userId}/`);
    return this.mapUser(getResponse.data);
  }

  async deleteUser(id: number): Promise<void> {
    await httpClient.delete(`/users/${id}/`);
  }
}
