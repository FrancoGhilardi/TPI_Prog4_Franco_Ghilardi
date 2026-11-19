import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '@/features/usuarios/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useUsuarios = () => useQuery({ queryKey: QUERY_KEYS.usuarios, queryFn: usuariosApi.listar });

export const useActivarUsuario = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosApi.activar(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: QUERY_KEYS.usuarios }),
  });
};

export const useDesactivarUsuario = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosApi.desactivar(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: QUERY_KEYS.usuarios }),
  });
};
