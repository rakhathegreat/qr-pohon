// src/pages/Profile.tsx
import { useEffect, useState } from "react"
import { LogOut, QrCode } from "lucide-react"
import Navbar from "../../components/Navbar"
import Button from "../../components/Button"
import { supabase } from "../../lib/supabase"

const Profile = () => {
  const [scanCount, setScanCount] = useState(0)

  // baca jumlah scan saat komponen mount
  useEffect(() => {
    const saved = Number(localStorage.getItem("scanCount") || "0")
    setScanCount(saved)
  }, [])

  const handleLogout = async () => {
    // 1. hapus session Supabase
    await supabase.auth.signOut()

    // 2. bersihkan localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("scanCount")

    // 3. arahkan ke login
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-brand-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

        {/* Kartu statistik */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-100 rounded-full">
              <QrCode className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Scan</p>
              <p className="text-3xl font-bold text-gray-800">{scanCount}</p>
            </div>
          </div>
        </div>

        {/* tombol logout */}
        <Button
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      <Navbar />
    </div>
  )
}

export default Profile