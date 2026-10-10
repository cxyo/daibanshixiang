import { Outlet } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import NotificationScheduler from './components/NotificationScheduler';

function App() {
  return (
    <AppLayout>
      <NotificationScheduler />
      <Outlet />
    </AppLayout>
  );
}

export default App;
