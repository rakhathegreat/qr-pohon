import React, { useEffect, useState } from 'react';
import type { Tree } from './Tree';
import { supabase } from '../../lib/supabase';
import {
  Filter, Search, Trash, SquarePen, QrCode, SlidersVertical, LogOut
} from 'lucide-react';
import QRModal from '../../components/QRModal';

const limitOpts = [10, 20, 50, 100];

const Dashboard: React.FC = () => {
    const [trees, setTrees] = useState<Tree[]>([]);
    const [filter, setFilter] = useState('all');      // select filter
    const [sort, setSort]           = useState('name-asc');
    const [search, setSearch]       = useState('');
    const [page, setPage]           = useState(1);
    const [perPage, setPerPage]     = useState(10);
    const [total, setTotal]         = useState(0);
    const [qrOpen, setQrOpen] = useState(false);
    const [qrValue, setQrValue]   = useState('');

  const fetch = async () => {
    let q = supabase
      .from('trees')
      .select('*', { count: 'exact' })
      .ilike('common_name', `%${search}%`);

    // simple sort
    if (sort === 'name-asc')   q = q.order('common_name', { ascending: true });
    if (sort === 'name-desc')  q = q.order('common_name', { ascending: false });
    if (sort === 'recent')     q = q.order('created_at', { ascending: false });
    if (sort === 'oldest')     q = q.order('created_at', { ascending: true });

    const from = (page - 1) * perPage;
    const to   = from + perPage - 1;
    q = q.range(from, to);

    const { data, count, error } = await q;
    if (!error) {
      setTrees(data || []);
      setTotal(count ?? 0);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sort, search, page, perPage]);

  /* ---------- actions ---------- */
  const handleEdit   = (id: string) => nav(`/admin/edit/${id}`);
  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus data ini?')) return;
    await supabase.from('trees').delete().eq('id', id);
    fetch();                 // refresh
  };
  const handleViewQR = (id: string) => {
    // bisa URL frontend atau id saja
    const url = `${window.location.origin}/detail/${id}`;
    setQrValue(url);
    setQrOpen(true);
  };

  const handleLogout = async () => {
    // 1. hapus session Supabase
    await supabase.auth.signOut();

    // 2. bersihkan localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('scanCount');

    // 3. arahkan ke login
    window.location.href = '/login';
  }

  /* ---------- pagination text ---------- */
  const start = (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);

    // Simple navigation using window.location
    function nav(path: string): void {
        window.location.href = path;
    }
  return (
    <div className="h-screen px-5 py-5 space-y-4">
        
      <div className='flex items-center justify-between w-full mb-10'>
        <button onClick={handleLogout} className="md:hidden border border-gray-300 p-2 rounded-lg">
            <LogOut className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="font-sans text-xl font-bold">Dashboard</h1>
        <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
      </div>
      <div className="flex items-center justify-end w-full">
        <button onClick={() => nav('/admin/add')} className="text-white bg-brand-700 hover:bg-brand-800 font-medium rounded-lg text-sm px-5 py-2">
          + Add Tree
        </button>
      </div>

      {/* Filter / Sort / Search */}
      <div className="w-full gap-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring ring-brand-700">
            <div className="py-2 pl-2 pr-1 bg-white rounded-lg">
              <Filter className="w-4 h-4 text-gray-800" />
            </div>
            <select
              className="font-sans w-full text-gray-800 text-sm font-semibold py-2 rounded-lg bg-white focus:outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Filters</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring ring-brand-700">
            <div className="py-2 pl-2 pr-1 bg-white rounded-lg">
              <SlidersVertical className="w-4 h-4 text-gray-800" />
            </div>
            <select
              className="font-sans w-full text-gray-800 text-sm font-semibold py-2 rounded-lg bg-white focus:outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="all">Sort</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className="relative flex items-center border border-gray-300 rounded-lg focus-within:ring ring-brand-700">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="font-sans w-full text-sm font-medium text-gray-800 py-2 pl-10 pr-4 rounded-lg bg-white focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Pagination info */}
      <div className="flex text-sm text-gray-400 font-medium items-center justify-between w-full">
        <p>
          {start} - {end} of {total} results
        </p>
        <div className="flex items-center gap-4">
          <p>Items per page</p>
          <select
            className="font-sans text-gray-800 font-medium p-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring ring-brand-700"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            {limitOpts.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {trees.map((tree) => (
          <div
            key={tree.id}
            className="flex flex-col gap-2 p-6 border border-gray-300 rounded-lg"
          >
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <p className="text-sm font-medium text-gray-500">Tree ID</p>
              <p className="text-sm truncate font-medium text-gray-500 text-end">{tree.id}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <p className="text-sm font-medium text-gray-500">Nama Pohon</p>
              <p className="text-sm truncate font-semibold text-gray-900 text-end">{tree.common_name}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <p className="text-sm font-medium text-gray-500">Scientific Name</p>
              <p className="text-sm truncate font-semibold italic text-gray-900 text-end">{tree.scientific_name}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <p className="text-sm font-medium text-gray-500">Coordinate</p>
              <p className="text-sm truncate font-semibold text-gray-900 text-end">
                {tree.coordinates.latitude},{tree.coordinates.longitude}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-sm truncate font-semibold text-gray-900 text-end">{tree.coordinates.location}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <p className="text-sm font-medium text-gray-500">Created Date</p>
              <p className="text-xs truncate font-semibold text-gray-500 text-end">
                {tree.created_at
                  ? new Date(tree.created_at).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '-'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => handleViewQR(tree.id)}
                className="w-full flex items-center justify-center gap-1 bg-brand-500 text-white hover:bg-brand-600 font-medium rounded-lg text-sm p-2"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(tree.id)}
                className="w-full flex items-center justify-center gap-1 bg-brand-500 text-white hover:bg-brand-600 font-medium rounded-lg text-sm p-2"
              >
                <SquarePen className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(tree.id)}
                className="w-full flex items-center justify-center gap-1 bg-red-500 text-white hover:bg-red-600 font-medium rounded-lg text-sm p-2"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

        {/* ---------- Pagination ---------- */}
        <div className="flex justify-between items-center">
        <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-sm text-gray-500 px-4 py-2 rounded border border-gray-500 bg-gray-100 disabled:opacity-50"
        >
            Prev
        </button>

        {/* Nomor halaman */}
        <div className="flex items-center gap-2">
            {Array.from({ length: Math.ceil(total / perPage) }, (_, i) => i + 1).map((n) => (
            <button
                key={n}
                onClick={() => setPage(n)}
                className={`text-sm px-4 py-2 rounded-md font-medium transition ${
                n === page
                    ? 'text-white bg-brand-500'
                    : 'text-gray-400 border border-brand-500'
                }`}
            >
                {n}
            </button>
            ))}
        </div>

        <button
            disabled={page * perPage >= total}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm px-4 py-2 rounded text-gray-500 border border-gray-500 bg-gray-100 disabled:opacity-50"
        >
            Next
        </button>
        </div>

        <QRModal
            open={qrOpen}
            onClose={() => setQrOpen(false)}
            value={qrValue}
        />
    </div>
  );
};

export default Dashboard;