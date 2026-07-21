import type { UserRepository, PaginatedUsers } from '../../../domain/ports/user.repository';

export class ListUsersUseCase {
  userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(limit?: number, offset?: number, search?: string): Promise<PaginatedUsers> {
    return this.userRepository.listUsers(limit, offset, search);
  }
}
