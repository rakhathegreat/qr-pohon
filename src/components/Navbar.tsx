// components/BottomNavbar.tsx
import { useNavigate, useLocation } from 'react-router-dom'
import {
  BiQrScan,
} from 'react-icons/bi'
import home from '../assets/home.svg'
import homeActive from '../assets/homeActive.svg'
import user from '../assets/user.svg'
import userActive from '../assets/userActive.svg'

export default function Navbar() {
  const nav = useNavigate()
  const loc = useLocation()

  const tabs = [
    {
      path: '/main',
      icon: (active: boolean) =>
        active ? <img className="w-6" src={homeActive} /> : <img className="w-6" src={home} />,
      label: 'Home',
    },
    {
      path: '/profile',
      icon: (active: boolean) =>
        active ? <img className="w-7" src={userActive} /> : <img className="w-7" src={user} />,
      label: 'Stats',
    }
  ]

  return (
    <>
      {/* tombol lingkaran hijau mengambang */}
      <button
        onClick={() => nav('/scan')}
        className={`fixed left-1/2 -translate-x-1/2 z-30
                   w-18 h-18 rounded-full ${location.pathname === '/scan' ? 'bg-brand-600 bottom-4' : 'bg-brand-500 bottom-3'} text-white
                   shadow-lg transition-transform duration-300 ease-in-out
                   flex items-center justify-center`}
        aria-label="Scan QR"
      >
        <BiQrScan className="text-3xl" />
      </button>

      {/* bar biasa (kosong di tengah) */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-white/80 backdrop-blur border-t border-gray-200">
        <div className="grid grid-cols-2 gap-14 px-2 pb-safe">
          {tabs.map((t) => {
            const active = loc.pathname === t.path
            return (
              <button
                key={t.path}
                onClick={() => nav(t.path)}
                className={`flex flex-col items-center justify-center py-3 text-xs rounded-lg
                  ${active ? 'text-brand-600' : 'text-gray-600'}`}
              >
                <div className="text-3xl">{t.icon(active)}</div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}