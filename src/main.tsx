import AuthCallback from './pages/AuthCallback';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Main from './pages/user/Main';
import Profile from './pages/user/Profile';
import Scan from './pages/user/Scan';
import Detail from './pages/user/Detail';
import Dashboard from './pages/admin/Dashboard';
import AddTree from './pages/admin/AddTree';
import EditTree from './pages/admin/EditTree';
import AdminLayout from './components/admin/AdminLayout';
import UserManagement from './pages/admin/UserManagement';
import GameRules from './pages/admin/GameRules';
import AntiCheat from './pages/admin/AntiCheat';
import Moderation from './pages/admin/Moderation';
import Analytics from './pages/admin/Analytics';
import AuditLog from './pages/admin/AuditLog';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  { path: '/main', element: <Main /> },
  { path: '/profile', element: <Profile /> },
  { path: '/scan', element: <Scan /> },
  { path: '/detail/:id', element: <Detail /> },
  { path: '/', element: <Navigate to="/login" replace /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'game-rules', element: <GameRules /> },
      { path: 'anti-cheat', element: <AntiCheat /> },
      { path: 'moderation', element: <Moderation /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'audit-log', element: <AuditLog /> },
      { path: 'add', element: <AddTree /> },
      { path: 'edit/:id', element: <EditTree /> },
      { index: true, element: <Navigate to="dashboard" replace /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <RouterProvider router={router} />
  // </StrictMode>
);
