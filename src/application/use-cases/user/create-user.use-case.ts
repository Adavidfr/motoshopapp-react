import type { UserRepository } from '../../../domain/ports/user.repository';
import type { User } from '../../../domain/entities/user.entity';

export class CreateUserUseCase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(data: Partial<User> & { password?: string, passwordConfirm?: string }): Promise<User> {
    return await this.userRepository.createUser(data);
  }
}
