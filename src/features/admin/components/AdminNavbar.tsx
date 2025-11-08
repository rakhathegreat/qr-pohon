import { useEffect, useRef, useState } from 'react';
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
import { cn } from '@shared/lib/cn';

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
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      setHeaderHeight(headerRef.current?.offsetHeight ?? 0);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    if (!mediaQuery.matches) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = 'hidden';

    return () => {
      style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2">
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
            className="inline-flex p-2 items-center justify-center rounded-full border border-gray-300 text-gray-600 lg:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>
      {open && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
            style={{ top: headerHeight }}
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-xl bg-white p-5 lg:hidden"
            style={{ top: headerHeight }}
          >
            <nav className="flex flex-col gap-2">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'border-brand-200 bg-brand-100 text-brand-700'
                        : 'text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default AdminNavbar;
