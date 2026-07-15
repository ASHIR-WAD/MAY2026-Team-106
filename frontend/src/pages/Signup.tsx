import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context'
import type { UserRole } from '../types/users'

export default function Signup() {
  const { signup, login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('ATTENDEE')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await signup({ email, password, name, phone, role })
      // Auto login after signup
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 transition-colors duration-200">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-center text-text-primary">
            Create Account
          </h1>
          <p className="text-center text-sm text-text-secondary mt-1">
            Join Gatherly today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Name</label>
            <input
              type="text"
              required
              placeholder="Your full name"
              className="w-full rounded-md border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Phone</label>
            <input
              type="tel"
              required
              placeholder="Phone number"
              className="w-full rounded-md border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent sm:text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">I want to register as</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setRole('ATTENDEE')}
                className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-150 ${
                  role === 'ATTENDEE'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-surface-alt text-text-secondary hover:text-text-primary'
                }`}
              >
                Attendee
              </button>
              <button
                type="button"
                onClick={() => setRole('ORGANISER')}
                className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-150 ${
                  role === 'ORGANISER'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                    : 'border-border bg-surface-alt text-text-secondary hover:text-text-primary'
                }`}
              >
                Organiser
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger mt-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-accent py-2.5 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-accent hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
