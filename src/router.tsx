import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import InboxPage from './pages/InboxPage';
import CalendarPage from './pages/CalendarPage';
import ImportantPage from './pages/ImportantPage';
import SearchPage from './pages/SearchPage';
import MorePage from './pages/MorePage';
import QuadrantPage from './pages/QuadrantPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <InboxPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'important', element: <ImportantPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'more', element: <MorePage /> },
      { path: 'quadrant', element: <QuadrantPage /> },
    ],
  },
]);
