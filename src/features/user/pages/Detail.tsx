// src/pages/Detail.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Compass, Leaf, MapPin, Sprout, type LucideIcon } from 'lucide-react';

import BottomNav from '@features/user/components/BottomNav';

import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/Card';
import Badge from '@shared/components/Badge';

import { supabase } from '@shared/services/supabase';

import type { Tree } from '@features/trees/types';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      const { data: record, error } = await supabase.from('trees').select('*').eq('id', id).single();

      if (!error && record) setTree(record as Tree);
      else console.error(error);
      setLoading(false);
    })();
  }, [id]);

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-brand-50 text-gray-600">
        Memuat detail pohon...
      </div>
    );
  if (!tree)
    return (
      <div className="grid min-h-screen place-items-center bg-brand-50 text-gray-600">
        Pohon tidak ditemukan
      </div>
    );

  const taxonomyEntries = Object.entries(tree.taxonomy);
  const plantedDate = new Date(tree.created_at).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const quickFacts: { icon: LucideIcon; label: string; value: React.ReactNode }[] = [
    { icon: MapPin, label: 'Lokasi tanam', value: tree.coordinates.location },
    {
      icon: Compass,
      label: 'Koordinat',
      value: `${tree.coordinates.latitude}, ${tree.coordinates.longitude}`,
    },
    { icon: Calendar, label: 'Terdata sejak', value: plantedDate },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-brand-50">
      <div className="mx-auto max-w-3xl space-y-8 px-6 pb-28 pt-10">
        <section className="rounded-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-emerald-500 p-8 text-white shadow-lg">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-white/80">Endemik {tree.endemic.region}</p>
            <h1 className="text-3xl font-semibold md:text-4xl">{tree.common_name}</h1>
            <p className="text-white/80 italic">{tree.scientific_name}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {quickFacts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-white/10 p-4 text-sm">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
                <p className="mt-1 font-semibold leading-relaxed text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-600">Visual identitas</p>
              <h2 className="text-xl font-semibold text-gray-900">Karakter pohon</h2>
            </div>
            <Badge variant="outline" className="text-brand-700">
              ID #{tree.id.slice(0, 8)}
            </Badge>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-between space-y-4 rounded-2xl bg-gray-50 p-6 text-gray-600">
              <p>
                Pohon ini tercatat dalam program konservasi dengan pengawasan berkala oleh tim PIC
                lapangan. Setiap scan membantu memantau perubahan kondisi di lapangan.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                <Sprout className="h-4 w-4" />
                Status pemantauan aktif
              </div>
            </div>
            <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-brand-100">
              <Leaf className="h-16 w-16 text-brand-600" />
            </div>
          </div>
        </section>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-brand-700">Taksonomi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {taxonomyEntries.map(([rank, name]) => (
              <div key={rank} className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">{rank}</p>
                <p className="text-base font-semibold text-gray-900">{name}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-brand-700">Informasi Endemik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-900">Wilayah utama</p>
              <Badge variant="secondary" className="mt-2 capitalize">
                {tree.endemic.region}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Negara</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tree.endemic.countries.map((country) => (
                  <Badge key={country} variant="outline">
                    {country}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Provinsi</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tree.endemic.provinces.map((province) => (
                  <Badge key={province} variant="default">
                    {province}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-brand-700">Lokasi & Koordinat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-800">
              <p className="font-semibold">{tree.coordinates.location}</p>
              <p className="mt-1 text-brand-700/70">
                {tree.coordinates.latitude}, {tree.coordinates.longitude}
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Informasi koordinat digunakan oleh relawan lapangan untuk memeriksa kondisi fisik pohon.
              Bila menemukan perubahan area atau lapisan tanah, laporkan ke PIC terdekat.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-brand-700">Kisah pohon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-900 leading-relaxed">{tree.description}</p>
            <div>
              <p className="text-sm font-semibold text-gray-900">Karakteristik unik</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-gray-700">
                {tree.characteristics.map((characteristic) => (
                  <li key={characteristic}>{characteristic}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
