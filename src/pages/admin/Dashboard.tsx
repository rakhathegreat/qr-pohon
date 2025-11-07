import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, ListFilter, ChevronDown, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react';
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
  { value: 'recent', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
];

type StatusFilter = 'all' | 'active' | 'inactive';
type CreatedFilter = 'all' | '7d' | '30d';

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
];

const createdOptions: Array<{ value: CreatedFilter; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: '7d', label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
];

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
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [createdFilter, setCreatedFilter] = useState<CreatedFilter>('all');
  const addMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
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

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (createdFilter !== 'all') {
      const days = createdFilter === '7d' ? 7 : 30;
      const since = new Date();
      since.setDate(since.getDate() - days);
      query = query.gte('created_at', since.toISOString());
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
  }, [debouncedSearch, page, perPage, sort, statusFilter, createdFilter]);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setAddMenuOpen(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

  const handleAddTree = () => navigate('/admin/add');

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setPage(1);
  };

  const hasActiveFilters =
    statusFilter !== 'all' || createdFilter !== 'all' || sort !== 'name-asc';

  return (
    <div className="min-h-screen bg-geist-50 pb-28 sm:pb-10">
      <div className="mx-auto space-y-7">
        <header className="border-b border-gray-300">
          <div className="flex flex-col mx-auto max-w-6xl gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4 px-4 py-7 md:py-10">
              <h1 className="text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">Tree Management</h1>
              <p className="text-sm font-normal text-gray-900">
                All tree data will be displayed here.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
            </div>
          </div>
        </header>

        <div className="space-y-4 px-4">
          
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            <div className="flex flex-row gap-3 sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative w-full">
                <Search strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search trees..."
                  value={search}
                  onValueChange={(val) => {
                    setSearch(val);
                    setPage(1);
                  }}
                  size="sm"
                  className="h-11 pl-10 bg-white"
                />
              </div>

              {/* Filter */}
              <div className="relative" ref={filterMenuRef}>
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="Filter data"
                  className="inline-flex h-11 items-center gap-2 px-4"
                  onClick={() => setFilterMenuOpen((prev) => !prev)}
                  aria-pressed={filterMenuOpen}
                >
                  <ListFilter strokeWidth={2.5} className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                </Button>

                {filterMenuOpen && (
                  <div className="absolute right-0 top-12 z-40 w-72 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                    <div className="space-y-2 text-xs font-semibold text-gray-500">
                      <div>
                        <p>Status</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          {statusOptions.map((option) => (
                            <button
                              type="button"
                              key={option.value}
                              onClick={() => setStatusFilter(option.value)}
                              className={cn(
                                'rounded-md border px-3 py-1.5 font-semibold',
                                statusFilter === option.value
                                  ? 'border-transparent bg-brand-100 text-brand-700'
                                  : 'border-gray-200 text-gray-600'
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p>Dibuat</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          {createdOptions.map((option) => (
                            <button
                              type="button"
                              key={option.value}
                              onClick={() => setCreatedFilter(option.value)}
                              className={cn(
                                'rounded-md border px-3 py-1.5 font-semibold',
                                createdFilter === option.value
                                  ? 'border-transparent bg-brand-100 text-brand-700'
                                  : 'border-gray-200 text-gray-600'
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p>Sort</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          {sortOptions.map((option) => (
                            <button
                              type="button"
                              key={option.value}
                              onClick={() => setSort(option.value)}
                              className={cn(
                                'rounded-md border px-3 py-1.5 font-semibold',
                                sort === option.value
                                  ? 'border-transparent bg-brand-100 text-brand-700'
                                  : 'border-gray-200 text-gray-600'
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 flex-1 py-1"
                        onClick={() => {
                          setStatusFilter('all');
                          setCreatedFilter('all');
                          setSort('name-asc');
                          setFilterMenuOpen(false);
                        }}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        className="h-9 flex-1 py-1"
                        onClick={() => setFilterMenuOpen(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add New */}
              <div className="relative" ref={addMenuRef}>
                <Button
                  size="sm"
                  variant="primary"
                  aria-label="Tambah pohon"
                  className="h-11 inline-flex items-center gap-2 px-4 sm:w-auto"
                  onClick={() => setAddMenuOpen((prev) => !prev)}
                >
                  <span className="hidden sm:inline sm:whitespace-nowrap">Add New...</span>
                  <ChevronDown strokeWidth={2} className="h-4 w-4 hidden sm:inline" />
                  <Plus strokeWidth={2} className="h-4 w-4 inline sm:hidden" />
                </Button>

                {addMenuOpen && (
                  <div className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        handleAddTree();
                        setAddMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-50"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Pohon
                    </button>

                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-50">
                      <UploadCloud className="h-4 w-4" />
                      Impor CSV
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(event) => {
                          if (event.target.files?.length) {
                            console.info('Import CSV', event.target.files[0]);
                            event.target.value = '';
                          }
                          setAddMenuOpen(false);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </section>


          <section className="max-w-6xl mx-auto space-y-4">
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
            <div className="mx-auto mt-6 max-w-6xl rounded-lg border border-gray-300 bg-white px-4 py-3 sm:px-5">
              <div className="flex gap-4 flex-row md:items-center justify-between">
                {/* Summary: tampilkan mulai lg */}
                <p className="hidden lg:inline text-sm font-normal text-gray-600">
                  Menampilkan{' '}
                  <span className="font-medium text-gray-900">{Math.min(start, total)}</span> -{' '}
                  <span className="font-medium text-gray-900">{Math.min(end, total)}</span> dari{' '}
                  <span className="font-medium text-gray-900">{total}</span> pohon
                </p>

                <div className="flex flex-1 gap-3 md:flex-row md:items-center md:gap-4 lg:flex-0">
                  {/* Items / Page: tampilkan mulai lg */}
                  <label className="hidden lg:inline-flex whitespace-nowrap items-center gap-2 text-sm font-normal text-gray-500">
                    Items / Page
                    <select
                      value={perPage}
                      onChange={(e) => handlePerPageChange(Number(e.target.value))}
                      className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    >
                      {limitOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Pagination */}
                  <div className="flex flex-1 items-center justify-between gap-3 lg:flex-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 w-20"
                      disabled={page === 1}
                      onClick={() => setPage((prev) => prev - 1)}
                      aria-label="Halaman sebelumnya"
                    >
                      <div className="flex items-center gap-1">
                        <ChevronLeft strokeWidth={2.5} className="h-5 w-5" />
                        <span>Prev</span>
                      </div>
                    </Button>

                    <div className="flex flex-wrap justify-center gap-2">
                      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => setPage(n)}
                          className={cn(
                            buttonVariants({ variant: n === page ? 'primary' : 'ghost', size: 'sm' }),
                            'h-9 w-10 justify-center border border-brand-200'
                          )}
                          aria-current={n === page ? 'page' : undefined}
                          aria-label={`Ke halaman ${n}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-9 w-20"
                      disabled={page === pageCount || total === 0}
                      onClick={() => setPage((prev) => prev + 1)}
                      aria-label="Halaman berikutnya"
                    >
                      <div className="flex items-center gap-1">
                        <span>Next</span>
                        <ChevronRight strokeWidth={2.5} className="h-5 w-5" />
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}


          <QRModal open={qrOpen} onClose={() => setQrOpen(false)} value={qrValue} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
