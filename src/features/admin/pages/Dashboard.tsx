import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Search,
  Plus,
  ListFilter,
  ChevronDown,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Trash2,
  SquarePen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import QRModal from '@features/trees/components/QRModal';
import TreeCard from '@features/trees/components/TreeCard';
import TreeTable from '@features/trees/components/TreeTable';
import type { Tree, TreeCoordinates, TreeEndemic, TreeTaxonomy } from '@features/trees/types';
import Button, { buttonVariants } from '@shared/components/Button';
import Input from '@shared/components/Input';
import { cn } from '@shared/lib/cn';
import { supabase } from '@shared/services/supabase';

const limitOptions = [10, 20, 50, 100];

const treeSortOptions = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'recent', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
];

const locationSortOptions = [
  { value: 'lokasi-asc', label: 'Nama A-Z' },
  { value: 'lokasi-desc', label: 'Nama Z-A' },
  { value: 'recent', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
];

type StatusFilter = 'all' | 'active' | 'inactive';
type CreatedFilter = 'all' | '7d' | '30d';
type TableView = 'classification' | 'field' | 'locations';

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

const tableViewOptions: Array<{ value: TableView; label: string; description: string }> = [
  {
    value: 'classification',
    label: 'Tree Classification',
    description: 'Detail taksonomi lengkap (family, genus, species)',
  },
  {
    value: 'field',
    label: 'Tree Data',
    description: 'Data lokasi lapangan lengkap dengan QR code',
  },
  {
    value: 'locations',
    label: 'Locations',
    description: 'Kelola daftar lokasi fisik untuk pohon lapangan',
  },
];

type JenisPohonRow = {
  id: number;
  created_at: string | null;
  common_name: string;
  scientific_name: string | null;
  taxonomy: Partial<TreeTaxonomy> | null;
  endemic: Partial<TreeEndemic> | null;
  description: string | null;
  characteristics: string[] | null;
};

type LokasiRow = {
  id: number;
  lokasi: string;
  created_at?: string | null;
};

type DataPohonRow = {
  id: string;
  created_at: string | null;
  coordinates: Partial<TreeCoordinates> | null;
  jenis_pohon: JenisPohonRow | JenisPohonRow[] | null;
  lokasi: LokasiRow | LokasiRow[] | null;
};

const ensureTaxonomy = (value?: Partial<TreeTaxonomy> | null): TreeTaxonomy => ({
  kingdom: value?.kingdom ?? '',
  phylum: value?.phylum ?? '',
  class: value?.class ?? '',
  order: value?.order ?? '',
  family: value?.family ?? '',
  genus: value?.genus ?? '',
  species: value?.species ?? '',
});

const ensureEndemic = (value?: Partial<TreeEndemic> | null): TreeEndemic => ({
  region: value?.region ?? '',
  countries: Array.isArray(value?.countries) ? value?.countries ?? [] : [],
  provinces: Array.isArray(value?.provinces) ? value?.provinces ?? [] : [],
});

const ensureCoordinates = (
  value?: Partial<TreeCoordinates> | null,
  fallbackLocation?: string
): TreeCoordinates => ({
  latitude: typeof value?.latitude === 'number' ? value.latitude : Number(value?.latitude ?? 0),
  longitude: typeof value?.longitude === 'number' ? value.longitude : Number(value?.longitude ?? 0),
  location: value?.location ?? fallbackLocation ?? '-',
});

const mapJenisPohonRowToTree = (row: JenisPohonRow): Tree => ({
  id: String(row.id),
  common_name: row.common_name,
  scientific_name: row.scientific_name ?? '',
  taxonomy: ensureTaxonomy(row.taxonomy),
  endemic: ensureEndemic(row.endemic),
  coordinates: ensureCoordinates(undefined, row.endemic?.region ?? '-'),
  description: row.description ?? '',
  characteristics: row.characteristics ?? [],
  created_at: row.created_at ?? '',
  lokasi: undefined
});

const normalizeRelation = <T,>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
};

const mapDataPohonRowToTree = (row: DataPohonRow): Tree | null => {
  const jenisPohon = normalizeRelation(row.jenis_pohon);
  const lokasi = normalizeRelation(row.lokasi);
  if (!jenisPohon) return null;

  const coordinates = ensureCoordinates(row.coordinates);
  coordinates.location = lokasi?.lokasi ?? coordinates.location ?? '-';

  return {
    id: row.id,
    common_name: jenisPohon.common_name,
    scientific_name: jenisPohon.scientific_name ?? '',
    taxonomy: ensureTaxonomy(jenisPohon.taxonomy),
    endemic: ensureEndemic(jenisPohon.endemic),
    coordinates,
    description: jenisPohon.description ?? '',
    characteristics: jenisPohon.characteristics ?? [],
    created_at: row.created_at ?? jenisPohon.created_at ?? '',
    lokasi: lokasi,
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [locations, setLocations] = useState<LokasiRow[]>([]);
  const [sort, setSort] = useState<string>(treeSortOptions[0].value);
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
  const [tableView, setTableView] = useState<TableView>('field');
  const isLocationView = tableView === 'locations';
  const supportsStatusFilter = tableView === 'field';
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
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    try {
      if (tableView === 'classification') {
        let query = supabase
          .from('jenis_pohon')
          .select(
            'id, common_name, scientific_name, taxonomy, endemic, description, characteristics, created_at',
            { count: 'exact' }
          )
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

        if (createdFilter !== 'all') {
          const days = createdFilter === '7d' ? 7 : 30;
          const since = new Date();
          since.setDate(since.getDate() - days);
          query = query.gte('created_at', since.toISOString());
        }

        query = query.range(from, to);
        const { data, count, error } = await query;
        if (error) {
          console.error('Failed to fetch jenis_pohon', error.message);
          setTrees([]);
          setLocations([]);
          setTotal(0);
          return;
        }

        const rows = (data ?? []) as JenisPohonRow[];
        setTrees(rows.map(mapJenisPohonRowToTree));
        setLocations([]);
        setTotal(count ?? 0);
        return;
      }

      if (tableView === 'locations') {
        let query = supabase
          .from('lokasi')
          .select('id, lokasi, created_at', { count: 'exact' })
          .ilike('lokasi', `%${debouncedSearch}%`);

        switch (sort) {
          case 'lokasi-desc':
            query = query.order('lokasi', { ascending: false });
            break;
          case 'recent':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          default:
            query = query.order('lokasi', { ascending: true });
        }

        if (createdFilter !== 'all') {
          const days = createdFilter === '7d' ? 7 : 30;
          const since = new Date();
          since.setDate(since.getDate() - days);
          query = query.gte('created_at', since.toISOString());
        }

        query = query.range(from, to);
        const { data, count, error } = await query;
        if (error) {
          console.error('Failed to fetch lokasi', error.message);
          setLocations([]);
          setTrees([]);
          setTotal(0);
          return;
        }

        const rows = (data ?? []) as LokasiRow[];
        setLocations(rows);
        setTrees([]);
        setTotal(count ?? 0);
        return;
      }

      let query = supabase
        .from('data_pohon')
        .select(
          `
            id,
            created_at,
            coordinates,
            jenis_pohon:jenis_pohon_id (
              id,
              created_at,
              common_name,
              scientific_name,
              taxonomy,
              endemic,
              description,
              characteristics
            ),
            lokasi:lokasi_id (
              id,
              lokasi
            )
          `,
          { count: 'exact' }
        )
        .ilike('jenis_pohon.common_name', `%${debouncedSearch}%`);

      switch (sort) {
        case 'name-desc':
          query = query.order('common_name', { ascending: false, foreignTable: 'jenis_pohon' });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        default:
          query = query.order('common_name', { ascending: true, foreignTable: 'jenis_pohon' });
      }

      if (supportsStatusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (createdFilter !== 'all') {
        const days = createdFilter === '7d' ? 7 : 30;
        const since = new Date();
        since.setDate(since.getDate() - days);
        query = query.gte('created_at', since.toISOString());
      }

      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) {
        console.error('Failed to fetch data_pohon', error.message);
        setTrees([]);
        setTotal(0);
        return;
      }

      const rows = (data ?? []) as DataPohonRow[];
      const mapped = rows.map(mapDataPohonRowToTree).filter((tree): tree is Tree => tree !== null);

      setTrees(mapped);
      setLocations([]);
      setTotal(count ?? 0);
    } finally {
      setLoading(false);
    }
  }, [createdFilter, debouncedSearch, page, perPage, sort, statusFilter, supportsStatusFilter, tableView]);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  useEffect(() => {
    setPage(1);
    if (!supportsStatusFilter) {
      setStatusFilter('all');
    }
  }, [tableView, supportsStatusFilter]);

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
  const summaryLabel = isLocationView ? 'lokasi' : 'pohon';

  const handleAddLocation = async () => {
    const name = window.prompt('Nama lokasi baru');
    if (!name || !name.trim()) return;
    const { error } = await supabase.from('lokasi').insert({ lokasi: name.trim() });
    if (error) {
      alert(`Gagal menambah lokasi: ${error.message}`);
      return;
    }
    fetchTrees();
  };

  const handleEditLocation = async (row: LokasiRow) => {
    const name = window.prompt('Ubah nama lokasi', row.lokasi);
    if (!name || !name.trim() || name.trim() === row.lokasi) return;
    const { error } = await supabase.from('lokasi').update({ lokasi: name.trim() }).eq('id', row.id);
    if (error) {
      alert(`Gagal memperbarui lokasi: ${error.message}`);
      return;
    }
    fetchTrees();
  };

  const handleDeleteLocation = async (id: number) => {
    if (!window.confirm('Hapus lokasi ini? Data pohon yang terkait mungkin perlu diperbarui manual.')) {
      return;
    }
    const { error } = await supabase.from('lokasi').delete().eq('id', id);
    if (error) {
      alert(`Gagal menghapus lokasi: ${error.message}`);
      return;
    }
    fetchTrees();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus data ini?')) return;
    if (isLocationView) {
      await handleDeleteLocation(Number(id));
      return;
    }

    const targetTable = tableView === 'classification' ? 'jenis_pohon' : 'data_pohon';
    const targetId = tableView === 'classification' ? Number(id) : id;

    if (tableView === 'classification' && Number.isNaN(targetId)) {
      console.error('Invalid jenis_pohon id', id);
      return;
    }

    await supabase.from(targetTable).delete().eq('id', targetId);
    fetchTrees();
  };

  const handleEdit = (id: string) => {
    if (isLocationView) {
      const location = locations.find((loc) => loc.id === Number(id));
      if (location) handleEditLocation(location);
      return;
    }
    navigate(`/admin/edit/${id}`);
  };

  const handleViewQR = (id: string) => {
    if (isLocationView) return;
    const url = `${window.location.origin}/detail/${id}`;
    setQrValue(url);
    setQrOpen(true);
  };

  const handleAddTree = () => {
    if (isLocationView) {
      handleAddLocation();
      return;
    }
    navigate('/admin/add');
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setPage(1);
  };

  const isDesktop = useMediaQuery('(min-width: 640px)');
  const hasActiveFilters =
    (!isLocationView && createdFilter !== 'all') ||
    (!isLocationView && sort !== 'name-asc') ||
    (supportsStatusFilter && statusFilter !== 'all');
  useBodyScrollLock(!isDesktop && (addMenuOpen || filterMenuOpen));

  const closeFilterMenu = () => setFilterMenuOpen(false);
  const closeAddMenu = () => setAddMenuOpen(false);
  const resetFilters = () => {
    setStatusFilter('all');
    setCreatedFilter('all');
    setSort('name-asc');
  };

  const renderFilterFields = () => (
    <div className="space-y-4 text-xs font-semibold text-gray-500">
      {supportsStatusFilter && (
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
      )}

      {!isLocationView && (
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
      )}

      <div>
        <p>Sort</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
          {(isLocationView ? locationSortOptions : treeSortOptions).map((option) => (
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
  );

  const renderFilterActions = (className?: string) => (
    <div className={cn('flex gap-2', className)}>
      <Button
        size="sm"
        variant="outline"
        className="flex-1"
        onClick={() => {
          resetFilters();
          closeFilterMenu();
        }}
      >
        Reset
      </Button>
      <Button size="sm" className="flex-1" onClick={closeFilterMenu}>
        Apply
      </Button>
    </div>
  );

  const renderAddMenuContent = (variant: 'mobile' | 'desktop') => {
    if (tableView === 'locations') {
      const isMobileVariant = variant === 'mobile';
      const actionClasses = isMobileVariant
        ? 'rounded-2xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-800 hover:border-brand-300 hover:bg-brand-50'
        : 'rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-50';
      const baseClasses = 'flex w-full items-center gap-2 transition';

      return (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              handleAddLocation();
              closeAddMenu();
            }}
            className={cn(baseClasses, actionClasses)}
          >
            <MapPin className="h-4 w-4" />
            Tambah Lokasi
          </button>
        </div>
      );
    }

    const isMobileVariant = variant === 'mobile';
    const actionClasses = isMobileVariant
      ? 'rounded-2xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-800 hover:border-brand-300 hover:bg-brand-50'
      : 'rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-50';
    const baseClasses = 'flex w-full items-center gap-2 transition';

    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            handleAddTree();
            closeAddMenu();
          }}
          className={cn(baseClasses, actionClasses)}
        >
          <Plus className="h-4 w-4" />
          Tambah Pohon
        </button>

        <label className={cn('cursor-pointer', baseClasses, actionClasses)}>
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
              closeAddMenu();
            }}
          />
        </label>
      </div>
    );
  };

  const renderEmptyState = (message: string) => (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-center text-sm text-gray-500">
      {message}
    </div>
  );

  const renderDataContent = () => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-6 text-sm text-gray-500">
          Memuat data…
        </div>
      );
    }

    if (isLocationView) {
      if (locations.length === 0) {
        return renderEmptyState('Belum ada lokasi. Tambahkan lokasi baru untuk memetakan penanaman pohon.');
      }

      return (
        <>
          <div className="space-y-3 lg:hidden">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
              />
            ))}
          </div>
          <div className="hidden lg:block">
            <LocationTable
              data={locations}
              onEdit={handleEditLocation}
              onDelete={handleDeleteLocation}
            />
          </div>
        </>
      );
    }

    if (trees.length === 0) {
      return renderEmptyState('No trees found. Coba ubah kata kunci atau tambah data baru.');
    }

    const treeMode = tableView === 'classification' ? 'classification' : 'field';
    return (
      <>
        <div className="space-y-3 lg:hidden">
          {trees.map((tree) => (
            <TreeCard
              key={tree.id}
              tree={tree}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onViewQr={handleViewQR}
              mode={treeMode}
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
            mode={treeMode}
          />
        </div>
      </>
    );
  };

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

          <section className='mx-auto flex w-full max-w-6xl flex-col gap-4'>
            <div className="rounded-lg border border-gray-200 bg-white/80 p-1">
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {tableViewOptions.map((option) => {
                  const isActive = option.value === tableView;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setTableView(option.value)}
                      aria-pressed={isActive}
                      className={cn(
                        'flex flex-col rounded-lg p-2.5 text-center transition-colors',
                        isActive
                          ? 'bg-brand-100 text-brand-800 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
          
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            <div className="flex flex-row gap-3 sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative w-full">
                <Search strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={isLocationView ? 'Search location...' : tableView === 'classification' ? 'Search classification...' : 'Search tree...'}
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

                {filterMenuOpen &&
                  (isDesktop ? (
                    <div className="absolute right-0 top-12 z-40 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
                      {renderFilterFields()}
                      {renderFilterActions('mt-4')}
                    </div>
                  ) : (
                    <MobileSheet
                      onClose={closeFilterMenu}
                      title="Filter Data"
                      description="Sesuaikan tampilan daftar pohon"
                      footer={renderFilterActions('mt-5 border-t border-gray-100 pt-4')}
                    >
                      {renderFilterFields()}
                    </MobileSheet>
                  ))}
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

                {addMenuOpen &&
                  (isDesktop ? (
                    <div className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                      {renderAddMenuContent('desktop')}
                    </div>
                  ) : (
                    <MobileSheet
                      onClose={closeAddMenu}
                      title="Tambah Data"
                      description="Pilih aksi yang ingin dilakukan"
                      className="max-h-[60vh]"
                    >
                      {renderAddMenuContent('mobile')}
                    </MobileSheet>
                  ))}
              </div>
            </div>
          </section>


          <section className="max-w-6xl mx-auto space-y-4">{renderDataContent()}</section>

          {total > 0 && (
            <div className="mx-auto mt-6 max-w-6xl rounded-lg border border-gray-300 bg-white px-4 py-3 sm:px-5">
              <div className="flex gap-4 flex-row md:items-center justify-between">
                {/* Summary: tampilkan mulai lg */}
                <p className="hidden lg:inline text-sm font-normal text-gray-600">
                  Menampilkan{' '}
                  <span className="font-medium text-gray-900">{Math.min(start, total)}</span> -{' '}
                  <span className="font-medium text-gray-900">{Math.min(end, total)}</span> dari{' '}
                  <span className="font-medium text-gray-900">{total}</span> {summaryLabel}
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
    if (!active || typeof document === 'undefined') return;
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
    <div
      className="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-[1px]"
      onClick={onClose}
    />
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 max-h-[80vh] overflow-y-auto rounded-t-3xl border border-gray-200 bg-white p-5 shadow-[0_-20px_45px_rgba(15,23,42,0.25)]',
        className
      )}
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
          aria-label={`Tutup ${title}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
      {footer}
    </div>
  </>
);

type LocationTableProps = {
  data: LokasiRow[];
  onEdit: (row: LokasiRow) => void;
  onDelete: (id: number) => void;
};

type LocationCardProps = {
  location: LokasiRow;
  onEdit: (row: LokasiRow) => void;
  onDelete: (id: number) => void;
};

const formatLocationDate = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const LocationCard = ({ location, onEdit, onDelete }: LocationCardProps) => (
  <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-base font-semibold text-gray-900">{location.lokasi}</p>
        <p className="text-xs text-gray-500">
          Ditambahkan {formatLocationDate(location.created_at)}
        </p>
      </div>
      <span className="text-xs font-medium text-gray-400">ID #{location.id}</span>
    </div>
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        onClick={() => onEdit(location)}
      >
        <SquarePen className="h-4 w-4" />
        Edit
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
        onClick={() => onDelete(location.id)}
      >
        <Trash2 className="h-4 w-4" />
        Hapus
      </button>
    </div>
  </article>
);

const LocationTable = ({ data, onEdit, onDelete }: LocationTableProps) => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <table className="min-w-full border-separate border-spacing-0 text-sm text-gray-700">
      <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <tr>
          <th className="px-6 py-3 text-left">Lokasi ID</th>
          <th className="px-6 py-3 text-left">Nama Lokasi</th>
          <th className="px-6 py-3 text-left">Dibuat</th>
          <th className="px-6 py-3 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {data.map((location, index) => (
          <tr
            key={location.id}
            className={cn(
              'border-t border-gray-100',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
            )}
          >
            <td className="px-6 py-4 font-mono text-xs text-gray-500">#{location.id}</td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">{location.lokasi}</td>
            <td className="px-6 py-4 text-sm text-gray-600">
              {formatLocationDate(location.created_at)}
            </td>
            <td className="px-6 py-4 text-right">
              <div className="inline-flex gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => onEdit(location)}
                >
                  <SquarePen className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(location.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
