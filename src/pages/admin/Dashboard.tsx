import { useCallback, useEffect, useMemo, useState } from 'react';
import { LogOut, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tree } from '../../types/tree';
import { supabase } from '../../lib/supabase';
import QRModal from '../../components/QRModal';
import TreeCard from '../../components/admin/TreeCard';
import TreeTable from '../../components/admin/TreeTable';
import Button, { buttonVariants } from '../../components/Button';
import Input from '../../components/Input';
import { cn } from '../../lib/utils';

const limitOptions = [10, 20, 50, 100];

const sortOptions = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest' },
];

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  className?: string;
};

const StatCard = ({ label, value, helper, className }: StatCardProps) => (
  <div className={cn('min-w-[180px] rounded-2xl border border-gray-100 bg-brand-50/80 p-4', className)}>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    {helper && <p className="text-xs text-gray-500">{helper}</p>}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [sort, setSort] = useState<string>(sortOptions[0].value);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(limitOptions[0]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTrees = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('trees')
      .select('*', { count: 'exact' })
      .ilike('common_name', `%${debouncedSearch}%`);

    switch (sort) {
      case 'name-desc':
        query = query.order('common_name', { ascending: false });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      default:
        query = query.order('common_name', { ascending: true });
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('Failed to fetch trees', error.message);
    } else {
      setTrees(data ?? []);
      setTotal(count ?? 0);
    }

    setLoading(false);
  }, [debouncedSearch, page, perPage, sort]);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [perPage, total]);
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus data ini?')) return;
    await supabase.from('trees').delete().eq('id', id);
    fetchTrees();
  };

  const handleEdit = (id: string) => navigate(`/admin/edit/${id}`);

  const handleViewQR = (id: string) => {
    const url = `${window.location.origin}/detail/${id}`;
    setQrValue(url);
    setQrOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('scanCount');
    navigate('/login', { replace: true });
  };

  const handleAddTree = () => navigate('/admin/add');

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-6 pb-28 sm:pb-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-brand-100 bg-white/90 p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-500">
                Admin Dashboard
              </p>
              <h1 className="font-geist text-2xl font-medium text-gray-900 sm:text-3xl">photobooth-blob</h1>
              <p className="text-sm text-gray-500">
                Pantau dan kelola data pohon dengan cepat melalui tampilan tabel & kartu responsif.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Button
                size="sm"
                className="hidden sm:inline-flex sm:w-auto"
                onClick={handleAddTree}
              >
                + Add Tree
              </Button>
            </div>
          </div>
        </header>

        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="space-y-4 lg:grid lg:grid-cols-[2fr,1fr] lg:gap-4 lg:space-y-0">
            <div className="relative">
              <Search strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 z-10 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search trees..."
                value={search}
                onValueChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                size={'sm'}
                className="pl-10 bg-white"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sort by</p>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Items / page
                </p>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  value={perPage}
                  onChange={(event) => handlePerPageChange(Number(event.target.value))}
                >
                  {limitOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
            <StatCard
              label="Total Results"
              value={total.toString()}
              helper="Daftar pohon di database"
            />
            <StatCard
              label="Showing"
              value={`${Math.min(start, total)} - ${Math.min(end, total)}`}
              helper="Rentang halaman ini"
            />
            <StatCard
              label="Page"
              value={`${page}/${pageCount}`}
              helper="Navigasi daftar pohon"
            />
          </div>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-sm text-gray-500">
              Loading trees…
            </div>
          ) : trees.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-center text-sm text-gray-500">
              No trees found. Coba ubah kata kunci atau tambah data baru.
            </div>
          ) : (
            <>
              <div className="space-y-3 lg:hidden">
                {trees.map((tree) => (
                  <TreeCard
                    key={tree.id}
                    tree={tree}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onViewQr={handleViewQR}
                    className="bg-white"
                  />
                ))}
              </div>
              <div className="hidden lg:block">
                <TreeTable
                  data={trees}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onViewQr={handleViewQR}
                />
              </div>
            </>
          )}
        </section>

        {total > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold text-gray-900">{Math.min(start, total)}</span> -{' '}
                <span className="font-semibold text-gray-900">{Math.min(end, total)}</span> dari{' '}
                <span className="font-semibold text-gray-900">{total}</span> pohon
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setPage(n)}
                      className={cn(
                        buttonVariants({ variant: n === page ? 'primary' : 'ghost', size: 'sm' }),
                        'w-10 justify-center border border-brand-200'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={page === pageCount || total === 0}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <QRModal open={qrOpen} onClose={() => setQrOpen(false)} value={qrValue} />
      </div>
      <button
        type="button"
        onClick={handleAddTree}
        className="sm:hidden fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40"
        aria-label="Add new tree"
      >
        <Plus className="h-4 w-4" />
        Add Tree
      </button>
    </div>
  );
};

export default Dashboard;
