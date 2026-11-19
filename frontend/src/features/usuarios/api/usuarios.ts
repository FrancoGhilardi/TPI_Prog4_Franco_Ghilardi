import type { UserPublic } from '@/features/usuarios/types';
import { api } from '@/shared/api';

export const usuariosApi = {
  listar: async (): Promise<UserPublic[]> => {
    const { data } = await api.get<UserPublic[]>('/admin/usuarios');
    return data;
  },
  activar: async (id: number): Promise<UserPublic> => {
    const { data } = await api.post<UserPublic>(`/admin/usuarios/${id}/activar`);
    return data;
  },
  desactivar: async (id: number): Promise<UserPublic> => {
    const { data } = await api.post<UserPublic>(`/admin/usuarios/${id}/desactivar`);
    return data;
  },
};
