import { useState } from 'react'
import { useAuth } from '../context'

export function ProfileUpdatePage() {
  const { user, updateProfile } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [description, setDescription] = useState(user?.description || '')
  const [pfpUrl, setPfpUrl] = useState(user?.pfp_url || '')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!user) return null

  const avatars = [
    'https://picsum.photos/seed/avatar1/200',
    'https://picsum.photos/seed/avatar2/200',
    'https://picsum.photos/seed/avatar3/200',
    'https://picsum.photos/seed/avatar4/200',
  ]

  const validatePhone = (phoneStr: string) => {
    if (!phoneStr) return true
    const phoneRegex = /^\+?[1-9]\d{9,14}$/
    return phoneRegex.test(phoneStr)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMsg('')
    setErrorMsg('')

    if (!validatePhone(phone)) {
      setErrorMsg('Please enter a valid phone number (minimum 10 digits, numbers only).')
      setIsLoading(false)
      return
    }

    try {
      updateProfile({
        name,
        phone: phone || null,
        description: description || null,
        pfp_url: pfpUrl || null,
      })
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch {
      // Mock update profile shouldn't fail
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title block */}
      <div className="bg-surface/50 backdrop-blur-md border border-border p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your personal details, profile picture, and bio description
        </p>
      </div>

      {/* Main settings form card */}
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

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Form Fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Full name"
                className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                Bio / Description
              </label>
              <textarea
                rows={3}
                placeholder="Tell the Gatherly community about yourself..."
                className="w-full rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent text-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Profile Avatar selector */}
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
                    className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all transform hover:scale-105 ${
                      pfpUrl === url ? 'border-accent ring-2 ring-accent/30' : 'border-border'
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

          {/* Form submit footer */}
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
    </div>
  )
}
export default ProfileUpdatePage
