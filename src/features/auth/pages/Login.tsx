import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';

import Input from '@shared/components/Input';
import Button from '@shared/components/Button';
import { supabase } from '@shared/services/supabase';

import leaves from '@assets/leaves.svg';
import heroImage from '@assets/tree2.jpg';

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectByRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Gagal ambil role:", error.message)
      nav("/main") // fallback
      return
    }

    if (data?.role === "admin") {
      nav("/admin/dashboard")
    } else {
      nav("/main")
    }
  }, [nav])

  /* ---------- login email ---------- */
  async function handleLogin(event?: FormEvent) {
    event?.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    if (data?.user) {
      await redirectByRole(data.user.id)
    }
  }

  /* ---------- cek session yang sudah ada ---------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectByRole(session.user.id)
      }
    })
  }, [redirectByRole])

  return (
    <main className="min-h-screen bg-brand-900">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-2">
        {/* FORM SIDE */}
        <section className="flex items-center justify-center bg-geist-50 px-6 py-12 sm:px-10 lg:px-14">
          <div className="w-full max-w-md space-y-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-brand-100 bg-white px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.45em] text-brand-600">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                Admin Panel
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
                  <img src={leaves} alt="QR Pohon" className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-400">QR Pohon</p>
                  <h1 className="text-3xl font-semibold text-brand-800">Masuk ke dashboard admin</h1>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Gunakan akun internal untuk mengelola data pohon, lokasi, dan aktivitas monitoring secara real-time.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                id="email"
                label="Email organisasi"
                type="email"
                placeholder="nama@qrpohon.id"
                value={email}
                onValueChange={setEmail}
              />
              <Input
                id="password"
                label="Kata sandi"
                type="password"
                placeholder="••••••••"
                value={password}
                onValueChange={setPassword}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Pastikan perangkat aman.</span>
                <a href="#" className="font-semibold text-brand-700 hover:underline">
                  Lupa password?
                </a>
              </div>

              <Button type="submit" disabled={loading} size="full">
                {loading ? 'Memproses…' : 'Masuk'}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                atau
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              <button
                type="button"
                onClick={async () =>
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback` }
                  })
                }
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-4 text-base font-semibold text-gray-800 transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50"
                aria-label="Login dengan Google"
              >
                <FcGoogle className="text-2xl" />
                Masuk dengan Google
              </button>
            </div>

            <div className="rounded-2xl bg-white px-5 py-4 text-sm text-gray-600">
              Belum punya akses admin?{' '}
              <a href="#" className="font-semibold text-brand-700 hover:underline">
                Hubungi super admin
              </a>
            </div>
          </div>
        </section>

        {/* BRAND SIDE */}
        <section className="relative flex items-center justify-center overflow-hidden bg-brand-700 px-8 py-12 text-white">
          <img
            src={heroImage}
            alt="Kanopi pohon"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 opacity-95" />
          <div className="relative z-10 w-full max-w-xl space-y-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/70">Monitoring</p>
              <h2 className="mt-3 text-4xl font-semibold leading-snug">
                Pantau kesehatan pohon dan progres penanaman dari satu layar.
              </h2>
              <p className="mt-4 text-base text-white/80">
                Data lokasi, riwayat scan, hingga perawatan harian tersaji dalam dashboard desktop agar keputusan lapangan lebih cepat.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Pohon terdata</p>
                <p className="mt-2 text-3xl font-semibold">2.184</p>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">tersinkron</span>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Lokasi aktif</p>
                <p className="mt-2 text-3xl font-semibold">36</p>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">monitoring</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center justify-between text-sm text-white/80">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/70">Scan terbaru</p>
                  <p className="mt-1 font-semibold text-white">Taman Kota Bandung</p>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                  98% sehat
                </span>
              </div>
              <p className="mt-4 text-sm text-white/70">
                Tim lapangan memperbarui status melalui QR sehingga admin bisa langsung memverifikasi dan menjadwalkan perawatan.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
