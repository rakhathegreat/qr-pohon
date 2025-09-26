import AuthCallback from './pages/AuthCallback';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Main from './pages/user/Main';
import Profile from './pages/user/Profile';
import Scan from './pages/user/Scan';
import Detail from './pages/user/Detail';
import Dashboard from './pages/admin/Dashboard';  // <-- import Dashboard
import AddTree from './pages/admin/AddTree';
import EditTree from './pages/admin/EditTree';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  { path: '/main', element: <Main /> },
  { path: '/profile', element: <Profile /> },
  { path: '/scan', element: <Scan /> },
  { path: '/detail/:id', element: <Detail /> },   // <-- tambahkan :id
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/admin/dashboard', element: <Dashboard /> },  // <-- tambahkan route untuk Dashboard
  { path: '/admin/add', element: <AddTree /> },     // <-- tambahkan route untuk AddTree
  { path: '/admin/edit/:id', element: <EditTree /> },  // <-- tambahkan route untuk EditTree
])

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <RouterProvider router={router} />
  // </StrictMode>
);