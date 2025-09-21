import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Input from '../components/Input'
import Button from '../components/Button'
import { FcGoogle } from 'react-icons/fc'
import leaves from '../assets/leaves.svg'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return alert(error.message)
    nav('/main')
  }

  return (
    <div className="min-h-screen flex items-center bg-brand-50">
      <div className="w-full h-screen flex flex-col justify-evenly px-10 py-10">
        {/* HEADER */}
        <div className="font-inter flex flex-col items-center space-y-4">
          <img src={leaves} alt="" className="w-13" />
          <h1 className="text-4xl font-bold text-brand-800">Sign In</h1>
          <p className="text-sm font-medium text-gray-700">
            Welcome back! Please enter your details
          </p>
        </div>

        {/* FORM */}
        <div className="w-full space-y-8">
          <div className="w-full space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end">
              <a href="#" className="underline text-sm font-medium text-brand-800">
                Forgot Password?
              </a>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="text-lg py-4 bg-brand-500 text-white rounded-lg"
          >
            {loading ? 'Signing in…' : 'Login'}
          </Button>
        </div>

        {/* SOCIAL CIRCLES */}
        <div className="w-full flex flex-col items-center gap-12">
          <div className='w-full flex flex-col items-center justify-center gap-6'>
              <div className="w-full flex items-center gap-3">
                <div className="h-px bg-gray-300 flex-1" />
                <span className="text-sm font-medium text-gray-600">Or</span>
                <div className="h-px bg-gray-300 flex-1" />
              </div>
            <div className="w-full flex gap-4">
              <button
                onClick={async () =>
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback` }
                  })
                }
                className="w-full py-4 rounded-lg bg-white border active:bg-gray-100 border-gray-200 flex items-center justify-center transition"
                aria-label="Login with Google"
              >
                <FcGoogle className="text-2xl mr-2" />
                Sign in with Google
              </button>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            Don’t have an account?{' '}
            <a href="#" className="underline text-sm font-medium text-brand-800">
              Sign Up
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}