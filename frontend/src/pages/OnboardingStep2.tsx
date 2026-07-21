import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context'

export function OnboardingStep2() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [description, setDescription] = useState(user?.description || '')
  const [pfpUrl, setPfpUrl] = useState(user?.pfp_url || '')
  const [dob, setDob] = useState(user?.dob || '')
  const [isLoading, setIsLoading] = useState(false)

  if (!user) return null

  const isOrganiser = user.role === 'ORGANISER'

  // Pre-configured profile pictures the user can pick
  const avatars = [
    'https://picsum.photos/seed/avatar1/200',
    'https://picsum.photos/seed/avatar2/200',
    'https://picsum.photos/seed/avatar3/200',
    'https://picsum.photos/seed/avatar4/200',
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result
      if (typeof dataUrl === 'string') {
        setPfpUrl(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Save profile details
    updateProfile({
      name,
      description: description || null,
      pfp_url: pfpUrl || null,
      dob: !isOrganiser && dob ? dob : null,
    })

    setIsLoading(false)
    // Complete onboarding and navigate home
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 shadow-2xl space-y-8 relative">
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-accent to-purple-500 rounded-t-2xl" />

        <div className="text-center">
          <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent/10 px-3 py-1 rounded-full">
            Step 2 of 2
          </span>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mt-3">
            Build Your Profile
          </h1>
          <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
            Let the community know who you are. These details can be updated anytime in your settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              {isOrganiser ? 'Organizer / Company Name' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              placeholder={isOrganiser ? "e.g. Beatworks Events" : "Your full name"}
              className="w-full rounded-md border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Date of Birth Field (only for Attendee / User) */}
          {!isOrganiser && (
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                className="w-full rounded-md border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent sm:text-sm"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          )}

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Bio / Description
            </label>
            <textarea
              rows={3}
              placeholder={isOrganiser ? "Tell attendees about the events you host, your brand, etc." : "Tell others about yourself, what events you enjoy, etc."}
              className="w-full rounded-md border border-border bg-surface-alt px-4 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent sm:text-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Profile Picture Chooser */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-text-secondary uppercase">
              Choose profile picture
            </label>
            <div className="flex items-center gap-4">
              <img
                src={pfpUrl || 'https://picsum.photos/seed/default/200'}
                alt="Profile Preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-accent"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  placeholder="Or paste profile image URL"
                  className="w-full rounded-md border border-border bg-surface-alt px-4 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent text-xs"
                  value={pfpUrl.startsWith('data:') ? '' : pfpUrl}
                  onChange={(e) => setPfpUrl(e.target.value)}
                />
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-surface-alt text-xs font-semibold text-text-primary cursor-pointer hover:bg-surface transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Upload from device
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {avatars.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPfpUrl(url)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-150 transform hover:scale-105 ${
                    pfpUrl === url ? 'border-accent ring-2 ring-accent/30' : 'border-border'
                  }`}
                >
                  <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end pt-4 border-t border-border/80 gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default OnboardingStep2
