import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { EllipsisVertical, ListFilter, Search, X } from 'lucide-react';

import Button, { buttonVariants } from '@shared/components/Button';
import Input from '@shared/components/Input';
import { cn } from '@shared/lib/cn';
import { supabase } from '@shared/services/supabase';

type UserStatus = 'active' | 'suspended' | 'pending';
type UserRole = 'superadmin' | 'admin' | 'field';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  raw_user_meta_data: Record<string, unknown> | null;
  raw_app_meta_data: Record<string, unknown> | null;
  last_sign_in_at: string | null;
  created_at: string | null;
};

type AdminRecord = {
  profile_id?: string | number | null;
  user_id?: string | number | null;
  id?: string | number | null;
};

const statusFilterOptions: Array<{ value: UserStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

const roleFilterOptions: Array<{ value: UserRole | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'field', label: 'Field Officer' },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const getMetaString = (payload?: Record<string, unknown> | null, key?: string) => {
  if (!payload || !key) return undefined;
  const value = payload[key];
  return typeof value === 'string' ? value : undefined;
};

const getMetaBoolean = (payload?: Record<string, unknown> | null, key?: string) => {
  if (!payload || !key) return undefined;
  const value = payload[key];
  return typeof value === 'boolean' ? value : undefined;
};

const ensureUserRole = (value?: string | null): UserRole => {
  if (value === 'superadmin' || value === 'admin' || value === 'field') {
    return value;
  }
  return 'field';
};

const deriveProfileName = (profile: ProfileRow) => {
  const meta = profile.raw_user_meta_data ?? {};
  const candidates = [
    getMetaString(meta, 'full_name'),
    getMetaString(meta, 'name'),
    getMetaString(meta, 'display_name'),
    getMetaString(meta, 'username'),
    profile.email,
  ];
  const resolved = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return typeof resolved === 'string' ? resolved : 'Unknown user';
};

const deriveProfileRole = (profile: ProfileRow): UserRole => {
  const candidate =
    getMetaString(profile.raw_user_meta_data, 'role') ??
    getMetaString(profile.raw_app_meta_data, 'role');
  return ensureUserRole(candidate);
};

const deriveProfileStatus = (profile: ProfileRow): UserStatus => {
  const statusCandidate =
    getMetaString(profile.raw_app_meta_data, 'status') ??
    getMetaString(profile.raw_user_meta_data, 'status');
  if (statusCandidate === 'active' || statusCandidate === 'pending' || statusCandidate === 'suspended') {
    return statusCandidate;
  }

  const suspendedFlag =
    getMetaBoolean(profile.raw_app_meta_data, 'suspended') ??
    getMetaBoolean(profile.raw_user_meta_data, 'suspended');
  if (suspendedFlag) return 'suspended';

  const pendingFlag =
    getMetaBoolean(profile.raw_app_meta_data, 'pending') ??
    getMetaBoolean(profile.raw_user_meta_data, 'pending');
  if (pendingFlag) return 'pending';

  return 'active';
};

const mapProfileToRow = (profile: ProfileRow): UserRow => ({
  id: profile.id,
  name: deriveProfileName(profile),
  email: profile.email ?? '—',
  role: deriveProfileRole(profile),
  status: deriveProfileStatus(profile),
  lastActive: profile.last_sign_in_at ?? profile.created_at ?? new Date().toISOString(),
});

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [pendingStatusFilter, setPendingStatusFilter] = useState<UserStatus | 'all'>('all');
  const [pendingRoleFilter, setPendingRoleFilter] = useState<UserRole | 'all'>('all');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 640px)');
  useBodyScrollLock(!isDesktop && filterMenuOpen);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredUsers = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        term.length === 0 ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [debouncedSearch, roleFilter, statusFilter, users]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filteredUsers.some((user) => user.id === id)));
  }, [filteredUsers]);

  useEffect(() => {
    if (!selectAllRef.current) return;
    const total = filteredUsers.length;
    const selected = selectedIds.length;
    selectAllRef.current.indeterminate = selected > 0 && selected < total;
  }, [filteredUsers.length, selectedIds]);

  useEffect(() => {
    const closeMenu = () => {
      setMenuOpenId(null);
      setBulkMenuOpen(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  useEffect(() => {
    if (!filterMenuOpen) return;
    setPendingStatusFilter(statusFilter);
    setPendingRoleFilter(roleFilter);
  }, [filterMenuOpen, roleFilter, statusFilter]);

  useEffect(() => {
    if (!filterMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterMenuRef.current?.contains(event.target as Node)) return;
      setFilterMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [filterMenuOpen]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const adminIds = new Set<string>();
    const { data: adminRows, error: adminError } = await supabase
      .from('admin')
      .select('profile_id, user_id, id');
    if (adminError) {
      console.warn('Failed to fetch admin records', adminError.message);
    } else {
      (adminRows as AdminRecord[] | null)?.forEach((row) => {
        const candidate = row.profile_id ?? row.user_id ?? row.id;
        if (candidate !== null && candidate !== undefined && candidate !== '') {
          adminIds.add(String(candidate));
        }
      });
    }

    const { data, error: supabaseError } = await supabase
      .from('profiles')
      .select('id, email, raw_user_meta_data, raw_app_meta_data, last_sign_in_at, created_at')
      .order('created_at', { ascending: true });

    if (supabaseError) {
      console.error('Failed to fetch profiles', supabaseError.message);
      setError(supabaseError.message);
      setUsers([]);
      setLoading(false);
      return;
    }

    const mapped =
      (data as ProfileRow[] | null)?.map(mapProfileToRow).filter((user) => !adminIds.has(user.id)) ?? [];

    setUsers(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredUsers.map((user) => user.id));
  };

  const hasSelection = selectedIds.length > 0;
  const hasActiveFilters = statusFilter !== 'all' || roleFilter !== 'all';

  const resetPendingFilters = () => {
    setPendingStatusFilter('all');
    setPendingRoleFilter('all');
  };

  const applyFilters = () => {
    setStatusFilter(pendingStatusFilter);
    setRoleFilter(pendingRoleFilter);
    setFilterMenuOpen(false);
  };

  const renderFilterFields = () => (
    <div className="space-y-4 text-xs font-semibold text-gray-500">
      <FilterDropdown
        label="Status"
        options={statusFilterOptions}
        value={pendingStatusFilter}
        onChange={(value) => setPendingStatusFilter(value as UserStatus | 'all')}
      />
      <FilterDropdown
        label="Role"
        options={roleFilterOptions}
        value={pendingRoleFilter}
        onChange={(value) => setPendingRoleFilter(value as UserRole | 'all')}
      />
    </div>
  );

  const renderFilterActions = (className?: string) => (
    <div className={cn('flex gap-2', className)}>
      <Button
        size="sm"
        variant="outline"
        className="flex-1"
        onClick={resetPendingFilters}
      >
        Reset
      </Button>
      <Button size="sm" className="flex-1 font-normal" onClick={applyFilters}>
        Apply
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-geist-50 pb-12">
      <div className="mx-auto w-full space-y-6">
        <header className="border-b border-gray-300">
          <div className="mx-auto flex px-6 lg:px-0 max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4 py-7 md:py-10">
              <h1 className="text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">Users Management</h1>
              <p className="text-sm font-normal text-gray-900">
                All users are listed here.
              </p>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-0">
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex w-full gap-2 flex-row lg:items-center lg:gap-3">
                <div className="relative w-full">
                  <Search strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email"
                    value={search}
                    onValueChange={setSearch}
                    size="sm"
                    className="h-11 bg-white pl-10"
                  />
                </div>
                <div className="flex justify-end lg:w-auto">
                  <div className="relative" ref={filterMenuRef}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="inline-flex h-11 items-center gap-2 px-4 w-full lg:w-auto"
                      aria-label="Filter users"
                      aria-pressed={filterMenuOpen}
                      onClick={(event) => {
                        event.stopPropagation();
                        setFilterMenuOpen((prev) => !prev);
                      }}
                    >
                      <ListFilter strokeWidth={2.5} className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                      {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                    </Button>

                    {filterMenuOpen &&
                      (isDesktop ? (
                        <div
                          className="absolute right-0 top-12 z-40 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {renderFilterFields()}
                          {renderFilterActions('mt-4')}
                        </div>
                      ) : (
                        <MobileSheet
                          onClose={() => setFilterMenuOpen(false)}
                          title="Filter Users"
                          description="Refine the user list"
                          footer={renderFilterActions('mt-5 border-t border-gray-100 pt-4')}
                        >
                          {renderFilterFields()}
                        </MobileSheet>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
              <table className="min-w-full border-separate border-spacing-0 text-sm text-gray-700">
                <thead
                  className="font-geist text-sm text-gray-600
                  [&_th]:px-6 [&_th]:py-4 [&_th]:font-normal [&_th]:bg-gray-50
                  [&_th]:border-b [&_th]:border-gray-200
                  [&_th:first-child]:rounded-tl-lg [&_th:last-child]:rounded-tr-lg"
                >
                  <tr>
                    <th className="w-12">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-brand-600 focus:ring-brand-500"
                        checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length}
                        onChange={toggleSelectAll}
                        aria-label="Select all users"
                      />
                    </th>
                    <th className="px-6 py-3 text-left">User ID</th>
                    <th className="px-6 py-3 text-left">Profile</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Last Active</th>
                    <th className="text-right">
                      <BulkMenuTrigger
                        disabled={!hasSelection}
                        open={bulkMenuOpen}
                        onToggle={(event) => {
                          event.stopPropagation();
                          setBulkMenuOpen((prev) => !prev);
                        }}
                        onExport={() => setBulkMenuOpen(false)}
                        onSuspend={() => setBulkMenuOpen(false)}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:not(:last-child)_td]:border-b [&_tr:not(:last-child)_td]:border-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-red-500">
                        Failed to load users: {error}
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        No users match your filters. Try adjusting the search or invite a new teammate.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const checked = selectedIds.includes(user.id);
                      return (
                        <tr
                          key={user.id}
                          className={cn('hover:bg-gray-50', checked && 'bg-brand-50/60')}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 accent-brand-600 focus:ring-brand-500"
                              checked={checked}
                              onChange={() => toggleSelect(user.id)}
                              aria-label={`Select ${user.name}`}
                            />
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">
                            <span
                              className="block max-w-[160px] truncate"
                              title={user.id}
                            >
                              {user.id}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-normal text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-normal text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            {user.status === 'active' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-300 bg-brand-100 px-3 py-1 text-xs font-medium text-brand-600">
                              {user.status}
                              </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                                  {user.status}
                                </span>
                              )}
                            
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{formatDate(user.lastActive)}</td>
                          <td className="px-6 py-4">
                            <div className="relative flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-gray-600')}
                                aria-label={`Actions for ${user.name}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setMenuOpenId((prev) => (prev === user.id ? null : user.id));
                                }}
                              >
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                              {menuOpenId === user.id && (
                                <div
                                  className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <ActionMenuButton label="View profile" />
                                  <ActionMenuButton label="Update role" />
                                  <ActionMenuButton label="Reset password" />
                                  <ActionMenuButton
                                    label={user.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                                    variant={user.status === 'suspended' ? 'default' : 'danger'}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const FilterDropdown = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col gap-2 text-xs font-semibold text-gray-500">
    <span>{label}</span>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-lg border px-4 py-2 text-xs font-medium transition',
              isActive
                ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

export default UserManagement;

const ActionMenuButton = ({
  label,
  variant = 'default',
  onClick,
}: {
  label: string;
  variant?: 'default' | 'danger';
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm',
      variant === 'danger'
        ? 'text-red-600 hover:bg-red-50'
        : 'text-gray-700 hover:bg-gray-100'
    )}
  >
    {label}
  </button>
);

const BulkMenuTrigger = ({
  disabled,
  open,
  onToggle,
  onExport,
  onSuspend,
}: {
  disabled: boolean;
  open: boolean;
  onToggle: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onExport: () => void;
  onSuspend: () => void;
}) => (
  <div className="relative inline-flex">
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        'text-gray-600',
        disabled && 'text-gray-300'
      )}
      aria-label="Bulk actions"
      aria-haspopup="menu"
      aria-expanded={open}
    >
      <EllipsisVertical className="h-4 w-4" />
    </Button>
    {open && (
      <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
        <ActionMenuButton label="Export selected" onClick={onExport} />
        <ActionMenuButton label="Promote to admin" onClick={onExport} />
        <ActionMenuButton label="Suspend selected" variant="danger" onClick={onSuspend} />
      </div>
    )}
  </div>
);

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

const useBodyScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
};

type MobileSheetProps = {
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

const MobileSheet = ({ onClose, title, description, children, footer, className }: MobileSheetProps) => (
  <>
    <div className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-[1px]" onClick={onClose} />
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 max-h-[80vh] overflow-y-auto rounded-t-3xl border border-gray-200 bg-white p-5 shadow-[0_-20px_45px_rgba(15,23,42,0.25)]',
        className
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
      {footer}
    </div>
  </>
);
