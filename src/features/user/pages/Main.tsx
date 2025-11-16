import { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  Gift,
  Leaf,
  MapPin,
  QrCode,
  ShieldCheck,
  Trophy,
  WifiOff,
  LocateFixed,
  Sparkles,
  Sprout,
  Award,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import BottomNav from '@features/user/components/BottomNav';

import { Button } from '@shared/components/Button';
import Badge from '@shared/components/Badge';

import tree from '@assets/tree.jpg';
import tree2 from '@assets/tree2.jpg';
import Badges from '../components/Badges';
import { supabase } from '@shared/services/supabase';
import type { User } from '@supabase/supabase-js';

type PermissionState = 'granted' | 'denied' | 'prompt';

type NearbyTree = {
  id: string;
  common_name: string;
  species?: string;
  lat: number;
  lng: number;
  distance_m?: number;
};

type Mission = {
  id: string;
  title: string;
  type: 'daily' | 'event' | 'species';
  progress: number;
  goal: number;
  reward_points: number;
  ends_at?: string;
};

type RewardTeaser = {
  id: string;
  name: string;
  cost_points: number;
  can_redeem: boolean;
};

type ActivityItem = {
  id: string;
  type: 'scan' | 'badge' | 'mission';
  title: string;
  ts: string;
  delta_points?: number;
};

const heroStats = [
  { label: 'Pohon terdata', value: '1.284', caption: 'area kampus & publik' },
  { label: 'Scan bulan ini', value: '3.982', caption: 'dari pengunjung aktif' },
  { label: 'PIC lapangan', value: '26', caption: 'siaga memantau' },
];

const howItWorks = [
  { title: 'Scan QR Code', description: 'Arahkan kamera pada plakat QR yang menempel di pohon.' },
  { title: 'Baca kisahnya', description: 'Ketahui asal-usul, endemik, dan cerita penanaman dalam hitungan detik.' },
  { title: 'Pantau bersama', description: 'Laporkan kondisi agar komunitas bisa merawat bersama.' },
];

const highlights = [
  { icon: Leaf, title: 'Identitas lengkap', description: 'Nama lokal & ilmiah, ciri unik tampil ringkas.' },
  { icon: MapPin, title: 'Lokasi akurat', description: 'Koordinat GPS & PIC memberi konteks penanaman.' },
  { icon: ShieldCheck, title: 'Pantauan real-time', description: 'Aktivitas scan jadi insight kesehatan pohon.' },
];

// ===== Mock payload (ganti dengan data Supabase kamu) =====
const MOCK_USER = { id: 'u1', points: 420, streak_days: 5, level: 2, badges_count: 6 };

const MOCK_NEARBY: NearbyTree[] = [
  { id: 't1', common_name: 'Trembesi Lapangan', species: 'Samanea saman', lat: -6.8631, lng: 107.9236 },
  { id: 't2', common_name: 'Eboni Gerbang Utara', species: 'Diospyros celebica', lat: -6.8637, lng: 107.9241 },
  { id: 't3', common_name: 'Kesambi Barat', species: 'Schleichera oleosa', lat: -6.8629, lng: 107.9229 },
  { id: 't4', common_name: 'Puspa Plaza', species: 'Schima wallichii', lat: -6.8640, lng: 107.9249 },
];

const MOCK_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Scan 3 spesies berbeda', type: 'daily', progress: 2, goal: 3, reward_points: 40 },
  { id: 'm2', title: 'Kunjungi hotspot Subang', type: 'event', progress: 0, goal: 1, reward_points: 50 },
  { id: 'm3', title: 'Baca 5 fakta botani', type: 'species', progress: 4, goal: 5, reward_points: 20 },
];

const MOCK_REWARDS: RewardTeaser[] = [
  { id: 'r1', name: 'Sticker Pack QR Pohon', cost_points: 150, can_redeem: true },
  { id: 'r2', name: 'Voucher Minum 15k', cost_points: 300, can_redeem: false },
  { id: 'r3', name: 'Badge “Guardian Roots”', cost_points: 200, can_redeem: true },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'scan', title: 'Scan “Kesambi Barat”', ts: '10 m ago', delta_points: +10 },
  { id: 'a2', type: 'mission', title: 'Progress “3 spesies berbeda” (2/3)', ts: '20 m ago' },
  { id: 'a3', type: 'badge', title: 'Dapat badge “Green Sprout”', ts: '1 h ago', delta_points: +20 },
];

const MOCK_BADGES = [
  { id: 'b2', name: 'Guardian Roots', icon: Sparkles, points: 20 },
  { id: 'b3', name: 'Tree Lover', icon: Leaf, points: 30 },
  { id: 'b4', name: 'Tree Whisperer', icon: LocateFixed, points: 40 },
  { id: 'b4', name: 'Tree Whisperer', icon: LocateFixed, points: 40 }
];

const featuredStories = [
  { title: 'Trembesi Lapangan Upacara', subtitle: 'Dikunjungi 128 kali minggu ini' },
  { title: 'Eboni Gerbang Utara', subtitle: 'Perlu monitoring kelembapan tanah' },
];

// ===== Utils =====
const toRad = (v: number) => (v * Math.PI) / 180;
function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000; // meters
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return Math.round(R * c);
}
const fmtDist = (m?: number) => (m === undefined ? '' : m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`);

// ===== Main Component =====
function Main() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // Permissions & online
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [cameraPerm, setCameraPerm] = useState<PermissionState>('prompt');
  const [locationPerm, setLocationPerm] = useState<PermissionState>('prompt');

  // Geo & nearby
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearby, setNearby] = useState<NearbyTree[]>([]);
  const [loadingNearby, setLoadingNearby] = useState<boolean>(true);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Check camera permission (best-effort; not all browsers expose it)
  useEffect(() => {
    const check = async () => {
      try {
        const p: PermissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPerm(p.state as PermissionState);
        p.onchange = () => setCameraPerm(p.state as PermissionState);
      } catch {
        // fallback: keep 'prompt'
      }
    };
    check();
  }, []);

  // Geolocation & compute nearby
  useEffect(() => {
    let cleared = false;
    const fetchGeo = () => {
      if (!('geolocation' in navigator)) {
        setLocationPerm('denied');
        setLoadingNearby(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cleared) return;
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          setLocationPerm('granted');
          // hitung jarak lalu urut
          const withDist = MOCK_NEARBY.map((t) => ({
            ...t,
            distance_m: distanceMeters({ lat: latitude, lng: longitude }, { lat: t.lat, lng: t.lng }),
          }))
            .sort((a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0))
            .slice(0, 5);
          setNearby(withDist);
          setLoadingNearby(false);
        },
        () => {
          if (cleared) return;
          setLocationPerm('denied');
          setNearby(MOCK_NEARBY.slice(0, 3)); // fallback tanpa jarak
          setLoadingNearby(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };
    fetchGeo();
    return () => {
      cleared = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    supabase.auth.getUser().then(({ data, error }) => {
      if (ignore) return;
      if (!error) setUser(data.user ?? null);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.user_metadata?.display_name ?? user?.email ?? 'Explorer';

  const progressNextLevel = useMemo(() => {
    // Contoh hitung progress: target 500 poin per level
    const NEXT_LEVEL_TARGET = 500 * (MOCK_USER.level + 1);
    const curr = MOCK_USER.points;
    const remain = Math.max(NEXT_LEVEL_TARGET - curr, 0);
    const pct = Math.min(100, Math.round((curr / NEXT_LEVEL_TARGET) * 100));
    return { pct, remain, target: NEXT_LEVEL_TARGET };
  }, []);

  const scrollToSteps = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-brand-50 ">
      <div className='space-y-4 py-4'>
        <section className='px-4'>
          <div className='flex items-center justify-between'>
            <span className='text-xl font-semibold text-brand-700'>Welcome, {displayName.split(' ')[0]} !</span>
            <div className='flex gap-4'>
              <div className='items-center flex'>
                <div className='flex items-center gap-1 px-4 py-1.5 rounded-lg border border-gray-300'>
                  <Leaf strokeWidth={2.5} className='text-brand-500 w-4 h-4'/>
                  <span className='text-sm text-brand-700 font-semibold'>{MOCK_USER.points}</span>
                </div>
              </div>
              <div className='rounded-full h-10 w-10 bg-gray-500 ring-2 ring-brand-600'></div>
            </div>
          </div>
        </section>

        <section className='h-32 px-4'>
          <header className='flex flex-col justify-center h-full rounded-xl bg-gradient-to-bl from-brand-500 to-brand-600 bg-brand-700 px-4 space-y-4'>
            <div className='flex w-full justify-between'>
              <div className='flex flex-col'>
                <span className='text-white/80 text-sm'>Current Level</span>
                <span className='text-white text-2xl font-semibold'>Tree Explorer</span>
              </div>
              <div className='flex flex-col items-center justify-center bg-white/20 px-5 rounded-lg'>
                <span className='text-white text-2xl font-semibold'>{MOCK_USER.level}</span>
              </div>
            </div>
            <div className='flex items-center space-x-3 w-full'>
              <div
                className='relative flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden'
                role='progressbar'
                aria-valuenow={progressNextLevel.pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className='absolute inset-y-0 left-0 rounded-full bg-white transition-[width] duration-500 ease-out'
                  style={{ width: `${progressNextLevel.pct}%` }}
                />
              </div>
              <div className='flex flex-col items-end leading-tight'>
                <span className='text-[11px] font-normal whitespace-nowrap text-white/80'>
                  {MOCK_USER.points}/{progressNextLevel.target} XP
                </span>
              </div>
            </div>
          </header>
        </section>

        <section className='px-4'>
          <div className='flex space-x-2'>
            <div className='w-full p-3 rounded-lg border border-gray-300 bg-white'>
              <div className='flex items-center gap-2 '>
                <div className='bg-brand-100 p-2 rounded-lg'>
                  <Sprout strokeWidth={2.5} className='text-brand-500 w-5 h-5'/>
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold'>247</span>
                  <span className='text-sm text-gray-500'>Trees Scanned</span>
                </div>
              </div>
            </div>
            <div className='w-full p-3 rounded-lg border border-gray-300 bg-white'>
              <div className='flex items-center gap-2 '>
                <div className='bg-brand-100 p-2 rounded-lg'>
                  <Trophy strokeWidth={2.5} className='text-brand-500 w-5 h-5'/>
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold'>#1</span>
                  <span className='text-sm text-gray-500'>Rank</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='px-4'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-semibold text-brand-700'>Recent Badges</span>
              <span className='text-sm font-medium text-brand-700'>View All</span>
            </div>
            <div>
              <div className='grid grid-cols-4 space-x-2'>
                {MOCK_BADGES.map(({name, icon: Icon}) => (
                  <div className='bg-white border border-gray-300 flex flex-col rounded-lg px-2 py-4 space-y-2'>
                    <div className='flex justify-center'>
                      <div className='bg-gradient-to-bl from-brand-500 to-brand-600 p-4 rounded-full'>
                        <Icon  className='h-6 w-6 text-white' />
                      </div>
                    </div>
                    {/* <span className='text-[13px] text-center font-medium text-brand-700'>{name}</span> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className='px-4'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-semibold text-brand-700'>Daily Missions</span>
            </div>
            <div>
              <div className='grid grid-cols-1 space-y-2'>
                {MOCK_MISSIONS.map(({title, progress, goal, reward_points}) => {
                  const pct = Math.min(100, Math.round((progress / goal) * 100));
                  return (
                  <div className='bg-white border border-gray-300 flex flex-col rounded-lg p-4 space-y-2'>
                    <div className='flex gap-3 items-center'>
                      <div>
                        <div className='bg-brand-100 p-5 rounded-lg'>
                          <Award strokeWidth={2.5} className='text-brand-500 w-7 h-7' />
                        </div>
                      </div>
                      <div className='w-full space-y-2'>
                        <span className='text-sm font-medium text-brand-700'>{title}</span>
                        <div className='flex items-center gap-3'>
                          <div
                            className='relative flex-1 h-1 rounded-full bg-brand-50 overflow-hidden'
                            role='progressbar'
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className='absolute inset-y-0 left-0 rounded-full bg-brand-500 transition-[width] duration-500 ease-out'
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className='text-xs font-medium text-brand-600'>{progress}/{goal}</span>
                        </div>
                        <div className='flex justify-end'>
                          <span className='text-xs inline-flex bg-brand-100 gap-1 items-center text-brand-700 font-medium py-1 px-3 rounded-full'>
                            <Star fill='#2d4f3d' strokeWidth={2.5} className='w-3 h-3' />
                            {reward_points} points
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
          </div>
        </section>
        <section className='h-20'></section>
      </div>

      <BottomNav />
    </div>
  );
}

export default Main;
