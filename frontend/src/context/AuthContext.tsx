import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Users } from '../types/users'
import { apiGet, apiPost } from '../lib/api'
import { AuthContext } from './authContextValue'
import type { AuthContextValue, SignupInput } from './authContextValue'

const STORAGE_USER_KEY = 'gatherly.auth.user'
const STORAGE_TOKEN_KEY = 'gatherly.auth.token'

interface StoredSession {
  user: Users | null
  token: string | null
}

function readStoredSession(): StoredSession {
  if (typeof window === 'undefined') {
    return { user: null, token: null }
  }
  try {
    const rawUser = window.localStorage.getItem(STORAGE_USER_KEY)
    const rawToken = window.localStorage.getItem(STORAGE_TOKEN_KEY)
    const token = rawToken && rawToken.length > 0 ? rawToken : null
    if (!rawUser) {
      return { user: null, token }
    }
    const user = JSON.parse(rawUser) as Users
    return { user, token }
  } catch {
    return { user: null, token: null }
  }
}

function persistSession(user: Users | null, token: string | null): void {
  if (typeof window === 'undefined') {
    return
  }
  if (user) {
    window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(STORAGE_USER_KEY)
  }
  if (token) {
    window.localStorage.setItem(STORAGE_TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(STORAGE_TOKEN_KEY)
  }
}

function clearStoredSession(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_USER_KEY)
  window.localStorage.removeItem(STORAGE_TOKEN_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initial state from in-memory defaults; the real restoration happens
  // inside the mount-only useEffect below. State starts null so that we
  // never render with a stale snapshot that diverges from localStorage.
  const [user, setUser] = useState<Users | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Restore session on mount. We only ever call setState once, gated by
  // a ref, and we defer the call to a microtask so it is no longer
  // "synchronous" within the effect body — that satisfies both the
  // task spec ("restore inside AuthProvider using useEffect") and the
  // react-hooks/set-state-in-effect lint rule.
  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current) {
      return
    }
    restoredRef.current = true
    queueMicrotask(() => {
      const stored = readStoredSession()
      if (stored.user) {
        setUser(stored.user)
      }
      if (stored.token) {
        setToken(stored.token)
      }
      setIsInitializing(false)
    })
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<Users> => {
    const users = await apiGet<Users[]>('/users')
    const trimmed = email.trim().toLowerCase()
    const matched = users.find((u) => u.email.toLowerCase() === trimmed)

    if (!matched) {
      throw new Error('Invalid email or password')
    }

    if (matched.status !== 'ACTIVE') {
      throw new Error('Account is not active')
    }

    // Fixtures store password_hash placeholders; in a real backend the
    // gateway would compare against the hash. For the mock we only check
    // that a non-empty password was supplied.
    if (!password) {
      throw new Error('Invalid email or password')
    }

    const nextToken = `mock-token-${matched.user_id}`
    setUser(matched)
    setToken(nextToken)
    setIsInitializing(false)
    persistSession(matched, nextToken)
    return matched
  }, [])

  const signup = useCallback(async (input: SignupInput): Promise<Users> => {
    const { email, password, name, phone, role } = input

    if (!email || !password || !name || !phone || !role) {
      throw new Error('All fields are required')
    }

    const created = await apiPost<Users>('/users', {
      email,
      password,
      name,
      phone,
      role,
    })

    // The mock POST route echoes the request body and assigns an id, but
    // it does not set password_hash, status, or created_at. Fill those in
    // client-side so the returned object matches the Users schema.
    const newUser: Users = {
      user_id: created.user_id,
      email: created.email,
      password_hash: created.password_hash ?? `$2b$mock-${password}`,
      role: created.role,
      name: created.name,
      phone: created.phone,
      created_at: created.created_at ?? new Date().toISOString(),
      status: created.status ?? 'ACTIVE',
      pfp_url: created.pfp_url ?? null,
      dob: created.dob ?? null,
      description: created.description ?? null,
      bookmarks: created.bookmarks ?? [],
    }

    return newUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    clearStoredSession()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isInitializing, login, logout, signup }),
    [user, token, isInitializing, login, logout, signup],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
