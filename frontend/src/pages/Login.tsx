import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 transition-colors duration-200">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-center text-text-primary">
            Welcome Back
          </h1>
          <p className="text-center text-sm text-text-secondary mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="email@example.com"
              className="w-full rounded-md border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-md border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-accent py-2.5 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}