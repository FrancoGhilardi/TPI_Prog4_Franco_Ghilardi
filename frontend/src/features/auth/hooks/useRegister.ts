import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api';

export const useRegister = () => useMutation({ mutationFn: authApi.register });
