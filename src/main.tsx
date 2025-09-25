import AuthCallback from './pages/AuthCallback';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Main from './pages/Main';
import Profile from './pages/Profile';
import Scan from './pages/Scan';
import Detail from './pages/Detail';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  { path: '/main', element: <Main /> },
  { path: '/profile', element: <Profile /> },
  { path: '/scan', element: <Scan /> },
  { path: '/detail/:id', element: <Detail /> },   // <-- tambahkan :id
  { path: '/', element: <Navigate to="/login" replace /> },
])

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <RouterProvider router={router} />
  // </StrictMode>
);