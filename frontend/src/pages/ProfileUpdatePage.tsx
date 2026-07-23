import { useEffect, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context'
import type { Users } from '../types/users'

// Adjust the User import path/name above if your types folder exports it
// differently — the fields relied on below are: name, phone, description,
// pfp_url, status, docs, role, email.

type TabId = 'personal' | 'profile' | 'verification' | 'moderation'

export function ProfileUpdatePage() {
  const { user, updateProfile } = useAuth()
  const location = useLocation()
  const isOrganiser = user?.role === 'ORGANISER'
  const isAdmin = user?.role === 'ADMIN'

  const requestedTab = new URLSearchParams(location.search).get('tab')
  const defaultTab: TabId = requestedTab === 'moderation' && isAdmin
    ? 'moderation'
    : requestedTab === 'profile' && isOrganiser
      ? 'profile'
      : requestedTab === 'verification' && isOrganiser
        ? 'verification'
        : 'personal'

  const tabs: { id: TabId; label: string }[] = [
    { id: 'personal', label: 'Personal Info' },
    ...(isOrganiser
      ? [
          { id: 'profile' as const, label: 'Profile' },
          { id: 'verification' as const, label: 'Verification Status' },
        ]
      : []),
    ...(isAdmin ? [{ id: 'moderation' as const, label: 'Moderation Settings' }] : []),
  ]

  const [activeTab, setActiveTab] = useState<TabId>(defaultTab)

  useEffect(() => {
    const nextTab: TabId = requestedTab === 'moderation' && isAdmin
      ? 'moderation'
      : requestedTab === 'profile' && isOrganiser
        ? 'profile'
        : requestedTab === 'verification' && isOrganiser
          ? 'verification'
          : 'personal'

    setActiveTab(nextTab)
  }, [requestedTab, isAdmin, isOrganiser])

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title block */}
      <div className="bg-surface/50 backdrop-blur-md border border-border p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your personal details, profile picture, and account status
        </p>
      </div>

      {/* Tab nav — only rendered when there's more than one tab (organiser) */}
      {tabs.length > 1 && (
        <div className="flex gap-1 border border-border bg-surface rounded-2xl p-1.5 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-alt'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'personal' && (
        <PersonalInfoTab user={user} updateProfile={updateProfile} />
      )}
      {activeTab === 'profile' && isOrganiser && (
        <ProfileTab user={user} updateProfile={updateProfile} />
      )}
      {activeTab === 'verification' && isOrganiser && (
        <VerificationStatusTab user={user} />
      )}
      {activeTab === 'moderation' && isAdmin && (
        <ModerationSettingsTab user={user} />
      )}
    </div>
  )
}

function Banner({ type, message }: { type: 'success' | 'error'; message: string }) {
  const isSuccess = type === 'success'
  return (
    <div
      className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${isSuccess
          ? 'bg-success/10 border-success/30 text-success'
          : 'bg-danger/10 border-danger/30 text-danger'
        }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 shrink-0"
      >
        {isSuccess ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z"
          />
        )}
      </svg>
      {message}
    </div>
  )
}

interface TabProps {
  user: Users
  updateProfile: (data: Partial<Users>) => void
}

function PersonalInfoTab({ user, updateProfile }: TabProps) {
  const [name, setName] = useState(user.name || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [dob, setDob] = useState(user.dob || '')
  const [description, setDescription] = useState(user.description || '')
  const [pfpUrl, setPfpUrl] = useState(user.pfp_url || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const avatars = [
    'https://picsum.photos/seed/avatar1/200',
    'https://picsum.photos/seed/avatar2/200',
    'https://picsum.photos/seed/avatar3/200',
    'https://picsum.photos/seed/avatar4/200',
    'https://picsum.photos/seed/avatar5/200',
    'https://picsum.photos/seed/avatar6/200',
  ]

  const validatePhone = (phoneStr: string) => {
    if (!phoneStr) return true
    const phoneRegex = /^\+?[1-9]\d{9,14}$/
    return phoneRegex.test(phoneStr)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMsg('')
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg('Name is required.')
      setIsLoading(false)
      return
    }

    if (!validatePhone(phone)) {
      setErrorMsg('Please enter a valid phone number (minimum 10 digits, numbers only).')
      setIsLoading(false)
      return
    }

    if (password && password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      setIsLoading(false)
      return
    }

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      setIsLoading(false)
      return
    }

    try {
      updateProfile({
        name: name.trim(),
        phone: phone || null,
        dob: dob || null,
        description: description.trim() || null,
        pfp_url: pfpUrl || null,
        ...(password ? { password_hash: password } : {}),
      })
      setPassword('')
      setConfirmPassword('')
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch {
      // Mock update profile shouldn't fail
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-border bg-surface rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {successMsg && <Banner type="success" message={successMsg} />}
        {errorMsg && <Banner type="error" message={errorMsg} />}

        {/* Profile Picture Section */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-border">
          <img
            src={pfpUrl || 'https://picsum.photos/seed/default/200'}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 border-accent shadow-md"
          />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <h3 className="text-lg font-bold text-text-primary">{name || 'Your Profile'}</h3>
            <p className="text-xs text-text-secondary">{user.email}</p>
            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent uppercase tracking-wider">
              {user.role}
            </div>
          </div>
        </div>

        {/* Avatar Picker */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-text-secondary uppercase">
            Profile Picture
          </label>
          <div className="flex flex-wrap gap-3">
            {avatars.map((url, idx) => (
              <button
                key={url}
                type="button"
                onClick={() => setPfpUrl(url)}
                className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all transform hover:scale-105 ${
                  pfpUrl === url ? 'border-accent ring-2 ring-accent/30' : 'border-border'
                }`}
              >
                <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <input
            type="url"
            placeholder="Or enter a custom profile picture URL..."
            className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent text-xs"
            value={pfpUrl}
            onChange={(e) => setPfpUrl(e.target.value)}
          />
        </div>

        {/* Personal Details */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Personal Details</h3>
          <p className="text-xs text-text-secondary">Update your name, contact, and personal information</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Your full name"
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              disabled
              className="w-full rounded-lg border border-border bg-surface-alt/50 px-4 py-2.5 text-text-secondary outline-none text-sm cursor-not-allowed"
              value={user.email}
            />
            <p className="text-[10px] text-text-secondary mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Phone number"
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </div>

        {/* Bio / Description */}
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
            Bio
          </label>
          <textarea
            rows={3}
            placeholder="Tell us a bit about yourself..."
            className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-[10px] text-text-secondary mt-1">{description.length}/300 characters</p>
        </div>

        {/* Security Section */}
        <div className="space-y-1 pt-2 border-t border-border/80">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider pt-4">Security</h3>
          <p className="text-xs text-text-secondary">Update your password</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border/80">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25 disabled:opacity-50"
          >
            {isLoading ? 'Saving changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ProfileTab({ user, updateProfile }: TabProps) {
  const [name, setName] = useState(user.name || '')
  const [description, setDescription] = useState(user.description || '')
  const [pfpUrl, setPfpUrl] = useState(user.pfp_url || '')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const avatars = [
    'https://picsum.photos/seed/avatar1/200',
    'https://picsum.photos/seed/avatar2/200',
    'https://picsum.photos/seed/avatar3/200',
    'https://picsum.photos/seed/avatar4/200',
  ]

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      updateProfile({ name, description: description || null, pfp_url: pfpUrl || null })
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-border bg-surface rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header pfp preview */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-border">
          <img
            src={pfpUrl || 'https://picsum.photos/seed/default/200'}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 border-accent shadow-md"
          />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <h3 className="text-lg font-bold text-text-primary">{name || 'Your Profile'}</h3>
            <p className="text-xs text-text-secondary">{user.email}</p>
            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent uppercase tracking-wider">
              {user.role}
            </div>
          </div>
        </div>

        {successMsg && <Banner type="success" message={successMsg} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Organiser Name
            </label>
            <input
              type="text"
              required
              placeholder="Organiser / company name"
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Tell attendees about your events..."
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 space-y-3">
            <label className="block text-xs font-bold text-text-secondary uppercase">
              Choose Profile Avatar
            </label>
            <div className="flex flex-wrap gap-3">
              {avatars.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPfpUrl(url)}
                  className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all transform hover:scale-105 ${pfpUrl === url ? 'border-accent ring-2 ring-accent/30' : 'border-border'
                    }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="pt-2">
              <input
                type="url"
                placeholder="Or enter custom profile picture image URL..."
                className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent text-xs"
                value={pfpUrl}
                onChange={(e) => setPfpUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border/80">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25 disabled:opacity-50"
          >
            {isLoading ? 'Saving changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ModerationSettingsTab({ user }: { user: Users }) {
  const [autoApprove, setAutoApprove] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const stored = window.localStorage.getItem('gatherly.admin.moderation')
      if (!stored) return true
      return JSON.parse(stored).autoApprove ?? true
    } catch {
      return true
    }
  })
  const [notifyNewReports, setNotifyNewReports] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const stored = window.localStorage.getItem('gatherly.admin.moderation')
      if (!stored) return true
      return JSON.parse(stored).notifyNewReports ?? true
    } catch {
      return true
    }
  })
  const [supportEmail, setSupportEmail] = useState(() => {
    if (typeof window === 'undefined') return 'support@gatherly.app'
    try {
      const stored = window.localStorage.getItem('gatherly.admin.moderation')
      if (!stored) return 'support@gatherly.app'
      return JSON.parse(stored).supportEmail ?? 'support@gatherly.app'
    } catch {
      return 'support@gatherly.app'
    }
  })
  const [successMsg, setSuccessMsg] = useState('')

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'gatherly.admin.moderation',
        JSON.stringify({ autoApprove, notifyNewReports, supportEmail })
      )
    }
    setSuccessMsg('Moderation settings saved locally.')
    window.setTimeout(() => setSuccessMsg(''), 3000)
  }

  return (
    <div className="border border-border bg-surface rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
      <div className="space-y-6">
        {successMsg && <Banner type="success" message={successMsg} />}

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-text-primary">Moderation Controls</h3>
          <p className="text-sm text-text-secondary">
            Manage the moderation preferences that shape how {user.name || 'this admin'} reviews platform activity.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface-alt/70 p-5">
          <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-4">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-border bg-surface-alt text-accent focus:ring-accent"
            />
            <div>
              <p className="font-semibold text-text-primary">Auto-approve organizer verifications</p>
              <p className="text-sm text-text-secondary">Allow the AI workflow to approve trusted submissions automatically.</p>
            </div>
          </label>

          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-surface px-4 py-4">
            <input
              type="checkbox"
              checked={notifyNewReports}
              onChange={(e) => setNotifyNewReports(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-border bg-surface-alt text-accent focus:ring-accent"
            />
            <div>
              <p className="font-semibold text-text-primary">Notify on new reports</p>
              <p className="text-sm text-text-secondary">Send an alert when a new moderation report is filed.</p>
            </div>
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-surface-alt/70 p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Support email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm"
            />
          </div>
          <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            Changes are saved locally in this demo. In production, these values will be managed through backend settings.
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/25"
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  )
}

function VerificationStatusTab({ user }: { user: Users }) {
  const isActive = user.status === 'ACTIVE'

  return (
    <div className="space-y-4">
      <div className="border border-border bg-surface rounded-2xl shadow-sm p-6 sm:p-8">
        <p className="text-xs font-bold text-text-secondary uppercase mb-2">Account Status</p>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}
        >
          {isActive ? '● Active' : '● Suspended'}
        </div>
        <p className="text-sm text-text-secondary mt-3">
          {isActive
            ? 'Your organiser account is verified and able to publish events.'
            : 'Your organiser account is currently suspended or pending review. Contact platform support for details.'}
        </p>
      </div>

      <div className="border border-border bg-surface rounded-2xl shadow-sm p-6 sm:p-8">
        <p className="text-xs font-bold text-text-secondary uppercase mb-2">
          Verification Documents
        </p>
        {user.docs ? (
          <a
            href={user.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent underline underline-offset-2"
          >
            View uploaded document
          </a>
        ) : (
          <p className="text-sm text-text-primary">No document uploaded yet.</p>
        )}
      </div>
    </div>
  )
}

export default ProfileUpdatePage