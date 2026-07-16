import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context'
import { apiGet } from '../lib/api'
import type { Users, UserRole } from '../types/users'

export default function Signup() {
  const { signup, login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('ATTENDEE')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Validation functions
  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailStr)
  }

  const validatePhone = (phoneStr: string) => {
    const phoneRegex = /^\+?[1-9]\d{9,14}$/
    return phoneRegex.test(phoneStr)
  }

  const validatePasswordStrength = (pass: string) => {
    const strengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return strengthRegex.test(pass)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions.')
      setIsLoading(false)
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      setIsLoading(false)
      return
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (minimum 10 digits).')
      setIsLoading(false)
      return
    }

    if (!validatePasswordStrength(password)) {
      setError(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&).'
      )
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    try {
      const users = await apiGet<Users[]>('/users')
      const emailExists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (emailExists) {
        setError('An account with this email address already exists.')
        setIsLoading(false)
        return
      }

      await signup({ email, password, name, phone, role })
      await login(email, password)
      navigate('/user/onboarding/step1', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#18181b] p-4 sm:p-6 transition-colors duration-200">
      <div className="w-full max-w-5xl rounded-3xl bg-[#202024] border border-white/5 shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[650px]">
        
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
            <h1 className="text-3xl font-extrabold tracking-tight">Create an account</h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-accent hover:underline font-semibold">
                Log in
              </Link>
            </p>
          </div>

          {/* Role selector pill */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Register role
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-[#252529] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setRole('ATTENDEE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-150 ${
                  role === 'ATTENDEE'
                    ? 'bg-accent text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Attendee / User
              </button>
              <button
                type="button"
                onClick={() => setRole('ORGANISER')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-150 ${
                  role === 'ORGANISER'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Organizer
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                required
                placeholder="Full name"
                className="w-full rounded-xl bg-[#252529] border border-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-accent transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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

            <div>
              <input
                type="tel"
                required
                placeholder="Phone number"
                className="w-full rounded-xl bg-[#252529] border border-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-accent transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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

            <div>
              <input
                type="password"
                required
                placeholder="Confirm password"
                className="w-full rounded-xl bg-[#252529] border border-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-accent transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-center gap-2.5 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-white/10 bg-[#252529] text-accent focus:ring-0"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span>
              I agree to the{' '}
              <a href="#terms" className="text-accent hover:underline">
                Terms & Conditions
              </a>
            </span>
          </label>

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
            {isLoading ? 'Creating Account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
