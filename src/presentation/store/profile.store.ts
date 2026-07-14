// src/presentation/store/profile.store.ts
import { create } from 'zustand';
import type { ClientePerfil } from '../../domain/entities/profile.entity';
import type { UpdateProfileDto } from '../../application/dtos/profile.dto';
import { getProfileUseCase, updateProfileUseCase } from '../../infrastructure/factories/profile.factory';

interface ProfileState {
  profile: ClientePerfil | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (dto: UpdateProfileDto) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getProfileUseCase.execute();
      set({ profile, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al obtener el perfil',
        isLoading: false,
      });
    }
  },

  updateProfile: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await updateProfileUseCase.execute(dto);
      set({ profile: updatedProfile, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Error al actualizar el perfil',
        isLoading: false,
      });
      throw err;
    }
  },

  clearProfile: () => set({ profile: null, error: null }),
}));
