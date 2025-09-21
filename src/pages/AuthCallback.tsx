// pages/AuthCallback.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const nav = useNavigate()

  useEffect(() => {
    // tunggu sampai sesi benar-benar tersedia
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) nav('/main', { replace: true })
      else nav('/login', { replace: true })   // gagal → kembali login
    })
  }, [nav])

  return (
    <div className="grid place-content-center h-screen">
      <p>Completing sign-in…</p>
    </div>
  )
}