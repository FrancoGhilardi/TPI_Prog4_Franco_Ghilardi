import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (intentos, error) => {
        const esErrorCliente =
          axios.isAxiosError(error) && error.response !== undefined && error.response.status < 500;
        return !esErrorCliente && intentos < 2;
      },
    },
  },
});
