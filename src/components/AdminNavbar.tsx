import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  Users,
  Gamepad2,
  ShieldCheck,
  Gavel,
  BarChart3,
  FileText,
  Menu,
  X,
  Trees,
} from 'lucide-react';
import { cn } from '../lib/utils';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard & Pohon', icon: Shield },
  { to: '/admin/users', label: 'Pengguna', icon: Users },
  { to: '/admin/game-rules', label: 'Aturan Game', icon: Gamepad2 },
  { to: '/admin/anti-cheat', label: 'Anti-Cheat', icon: ShieldCheck },
  { to: '/admin/moderation', label: 'Moderasi', icon: Gavel },
  { to: '/admin/analytics', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/audit-log', label: 'Audit Log', icon: FileText },
];

const AdminNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div className='flex items-center gap-2'>
          <Trees strokeWidth={2.5} className="h-5 w-5 text-brand-600" />
          <h1 className="text-lg font-medium text-gray-900">Admin Panel</h1>
        </div>
        <nav className="hidden items-center gap-2 lg:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
                  isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-200'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          aria-label="Toggle navigation"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-600 lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-gray-200 bg-white/95 px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
