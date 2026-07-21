import { ApiUserRepository } from '../adapters/api-user.repository';
import { ListUsersUseCase } from '../../application/use-cases/user/list-users.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/user/update-user.use-case';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/user/delete-user.use-case';

const userRepository = new ApiUserRepository();

export const listUsersUseCase = new ListUsersUseCase(userRepository);
export const updateUserUseCase = new UpdateUserUseCase(userRepository);
export const createUserUseCase = new CreateUserUseCase(userRepository);
export const deleteUserUseCase = new DeleteUserUseCase(userRepository);
