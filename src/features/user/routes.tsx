import Detail from './pages/Detail';
import Main from './pages/Main';
import Profile from './pages/Profile';
import Scan from './pages/Scan';

export const userRoutes = [
  { path: '/main', element: <Main /> },
  { path: '/profile', element: <Profile /> },
  { path: '/scan', element: <Scan /> },
  { path: '/detail/:id', element: <Detail /> },
];

export default userRoutes;
