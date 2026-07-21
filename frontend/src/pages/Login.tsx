import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context'
import type { UserRole } from '../types/users'

function homePathForRole(role: UserRole): string {
  switch (role) {
    case 'ORGANISER':
      return '/org'
    case 'ADMIN':
      return '/admin'
    case 'ATTENDEE':
    default:
      return '/'
  }
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // After a fresh login, always send the user to their role-based home.
  // We intentionally ignore any "from" state here — stale or otherwise —
  // so a sign-out → sign-in (potentially as a different user) cycle never
  // resumes the previous session's page.
  const from: string | null = null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const user = await login(email, password)
      const destination = from ?? homePathForRole(user.role)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#18181b] p-4 sm:p-6 transition-colors duration-200">
      <div className="w-full max-w-5xl rounded-3xl bg-[#202024] border border-white/5 shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* Left Column - Graphic / Image Backdrop */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between relative overflow-hidden bg-cover bg-center min-h-[300px] md:min-h-auto"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop')` }}
        >
          {/* Rich Dark Purple / Indigo Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#202024] via-purple-950/70 to-indigo-950/75 pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xl font-black text-white tracking-widest">
              GATHERLY
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all backdrop-blur-md border border-white/10"
            >
              Back to website
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="relative z-10 space-y-6 mt-16 md:mt-0">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Capturing Moments,<br />Creating Memories
            </h2>
            
            {/* Slider Pills */}
            <div className="flex gap-2">
              <span className="w-6 h-1 rounded-full bg-white/40" />
              <span className="w-6 h-1 rounded-full bg-white/40" />
              <span className="w-8 h-1 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <form onSubmit={handleSubmit} className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center space-y-6 text-white bg-[#1a1a1e]">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="text-accent hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full rounded-xl bg-[#252529] border border-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-accent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password input with toggle visibility eye icon */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                className="w-full rounded-xl bg-[#252529] border border-white/5 pl-4 pr-10 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-accent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Action Link: Forgot password */}
          <div className="flex justify-end">
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault()
                alert('Mock forgot password triggered.')
              }}
              className="text-xs text-accent hover:underline font-semibold"
            >
              Forgot password?
            </a>
          </div>

          {error && (
            <p className="text-xs text-danger leading-relaxed bg-danger/10 border border-danger/25 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-accent py-3 font-semibold text-white hover:opacity-95 transition-opacity disabled:opacity-50 shadow-lg shadow-accent/20 text-sm"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}