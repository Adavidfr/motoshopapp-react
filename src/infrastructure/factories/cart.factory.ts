// src/infrastructure/factories/cart.factory.ts
import { ApiCartRepository } from '../adapters/api-cart.repository';
import { GetActiveCartUseCase } from '../../application/use-cases/cart/get-active-cart.use-case';
import { AddItemToCartUseCase } from '../../application/use-cases/cart/add-item.use-case';
import { RemoveItemFromCartUseCase } from '../../application/use-cases/cart/remove-item.use-case';
import { ClearCartUseCase } from '../../application/use-cases/cart/clear-cart.use-case';

const cartRepository = new ApiCartRepository();

export const getActiveCartUseCase = new GetActiveCartUseCase(cartRepository);
export const addItemToCartUseCase = new AddItemToCartUseCase(cartRepository);
export const removeItemFromCartUseCase = new RemoveItemFromCartUseCase(cartRepository);
export const clearCartUseCase = new ClearCartUseCase(cartRepository);
