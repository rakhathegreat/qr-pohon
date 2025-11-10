import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { CheckCircle2, EllipsisVertical, Search, Shield, ShieldAlert, Users } from 'lucide-react';

import Badge from '@shared/components/Badge';
import Button, { buttonVariants } from '@shared/components/Button';
import Input from '@shared/components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/Card';
import { cn } from '@shared/lib/cn';

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

const sampleUsers: UserRow[] = [
  {
    id: 'SUP-001',
    name: 'Ayu Wulandari',
    email: 'ayu@example.com',
    role: 'superadmin',
    status: 'active',
    lastActive: '2024-02-04T09:10:00Z',
  },
  {
    id: 'ADM-014',
    name: 'Budi Setiawan',
    email: 'budi@example.com',
    role: 'admin',
    status: 'active',
    lastActive: '2024-02-04T07:45:00Z',
  },
  {
    id: 'FLD-233',
    name: 'Lina Prameswari',
    email: 'lina@example.com',
    role: 'field',
    status: 'suspended',
    lastActive: '2024-01-28T17:00:00Z',
  },
  {
    id: 'FLD-291',
    name: 'Arman Putra',
    email: 'arman@example.com',
    role: 'field',
    status: 'pending',
    lastActive: '2024-02-01T12:25:00Z',
  },
];

const roleLabels: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  field: 'Field Officer',
};

const roleBadges: Record<UserRole, { icon: typeof Shield; color: string }> = {
  superadmin: { icon: ShieldAlert, color: 'bg-rose-50 text-rose-700 border border-rose-100' },
  admin: { icon: Shield, color: 'bg-brand-50 text-brand-700 border border-brand-100' },
  field: { icon: Users, color: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
};

const statusLabels: Record<UserStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending: 'Pending',
};

const statusBadgeVariant: Record<UserStatus, 'success' | 'destructive' | 'secondary'> = {
  active: 'success',
  suspended: 'destructive',
  pending: 'secondary',
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return sampleUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [search, statusFilter, roleFilter]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filteredUsers.some((user) => user.id === id)));
  }, [filteredUsers]);

  useEffect(() => {
    if (!selectAllRef.current) return;
    const total = filteredUsers.length;
    const selected = selectedIds.length;
    selectAllRef.current.indeterminate = selected > 0 && selected < total;
  }, [selectedIds, filteredUsers.length]);

  useEffect(() => {
    const closeMenu = () => {
      setMenuOpenId(null);
      setBulkMenuOpen(false);
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

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

  return (
    <div className="min-h-screen bg-geist-50 pb-12">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
        <header className="space-y-4 rounded-3xl border border-gray-200 bg-white/90 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
            Access Control
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                User Management
              </h1>
              <p className="text-sm text-gray-600">
                Mirror the Tree Management layout to review admins, moderators, and field officers.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Invite Admin
              </Button>
              <Button size="sm">Create Role</Button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Total team"
            value="48"
            description="Active seats this month"
            icon={<Users className="h-4 w-4 text-brand-600" />}
          />
          <StatCard
            label="Super admins"
            value="04"
            description="Root access holders"
            icon={<ShieldAlert className="h-4 w-4 text-rose-600" />}
          />
          <StatCard
            label="Pending invites"
            value="06"
            description="Awaiting verification"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          />
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white/90 p-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search name, email, or ID..."
                  value={search}
                  onValueChange={setSearch}
                  className="h-12 rounded-2xl border-gray-200 bg-gray-50 pl-11 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <FilterDropdown
                  label="Status"
                  options={['all', 'active', 'pending', 'suspended']}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as UserStatus | 'all')}
                />
                <FilterDropdown
                  label="Role"
                  options={['all', 'superadmin', 'admin', 'field']}
                  value={roleFilter}
                  onChange={(value) => setRoleFilter(value as UserRole | 'all')}
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="min-w-full border-separate border-spacing-0 text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr className="[&_th]:px-6 [&_th]:py-4 [&_th]:text-left">
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
                  <th>User ID</th>
                  <th>Profile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
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
                {filteredUsers.map((user) => {
                  const badgeMeta = roleBadges[user.role];
                  const Icon = badgeMeta.icon;
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
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{user.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium',
                            badgeMeta.color
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusBadgeVariant[user.status] || 'default'}>
                          {statusLabels[user.status]}
                        </Badge>
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
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No users match your filters. Try adjusting the search or invite a new teammate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
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
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="flex flex-col text-xs font-semibold text-gray-500">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
        </option>
      ))}
    </select>
  </label>
);

const StatCard = ({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
}) => (
  <Card variant="solid" padding="lg" className="border border-gray-200 bg-white/90">
    <CardHeader>
      <CardTitle className="text-sm font-semibold text-gray-500">{label}</CardTitle>
    </CardHeader>
    <CardContent className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="rounded-xl bg-gray-100 p-3">{icon}</div>
    </CardContent>
  </Card>
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
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
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
