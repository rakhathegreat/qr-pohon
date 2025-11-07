import { Outlet } from 'react-router-dom';
import AdminNavbar from '../AdminNavbar';

const AdminLayout = () => (
  <div className="min-h-screen">
    <AdminNavbar />
    <main className="mx-auto">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
