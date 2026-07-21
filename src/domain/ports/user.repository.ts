import type { User } from '../entities/user.entity';

export interface PaginatedUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface UserRepository {
  listUsers(limit?: number, offset?: number, search?: string): Promise<PaginatedUsers>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  createUser(data: Partial<User> & { password?: string, passwordConfirm?: string }): Promise<User>;
  deleteUser(id: number): Promise<void>;
}
