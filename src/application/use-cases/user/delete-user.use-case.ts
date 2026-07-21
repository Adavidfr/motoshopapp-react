import type { UserRepository } from '../../../domain/ports/user.repository';

export class DeleteUserUseCase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: number): Promise<void> {
    await this.userRepository.deleteUser(id);
  }
}
