import { ApiUserRepository } from '../adapters/api-user.repository';
import { ListUsersUseCase } from '../../application/use-cases/user/list-users.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case';

const userRepository = new ApiUserRepository();

export const listUsersUseCase = new ListUsersUseCase(userRepository);
export const updateUserUseCase = new UpdateUserUseCase(userRepository);
