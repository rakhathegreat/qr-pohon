import AuthCallback from './pages/AuthCallback';
import Login from './pages/Login';

export const authRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/auth/callback', element: <AuthCallback /> },
];

export default authRoutes;
