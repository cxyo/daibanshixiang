import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import NotificationScheduler from './components/NotificationScheduler';
import { useTaskStore } from './store/useTaskStore';

function App() {
  useEffect(() => {
    const store = useTaskStore.getState();
    void store.bootstrap().then(() => store.initSync());

    const id = setInterval(() => {
      void useTaskStore.getState().pollSync();
    }, 5000);

    return () => clearInterval(id);
  }, []);

  return (
    <AppLayout>
      <NotificationScheduler />
      <Outlet />
    </AppLayout>
  );
}

export default App;
