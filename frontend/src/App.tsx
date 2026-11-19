import { useEffect, type FC } from 'react';
import { AppRouter } from '@/routes';
import { useAuthStore } from '@/store';

const App: FC = () => {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
};

export default App;
