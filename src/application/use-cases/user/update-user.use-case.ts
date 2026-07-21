import type { UserRepository } from '../../../domain/ports/user.repository';
import type { User } from '../../../domain/entities/user.entity';

export class UpdateUserUseCase {
  userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: number, data: Partial<User>): Promise<User> {
    return this.userRepository.updateUser(id, data);
  }
}
