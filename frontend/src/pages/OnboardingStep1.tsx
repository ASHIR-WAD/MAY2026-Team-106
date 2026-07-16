import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context'
import { interestTagsFixture, usersFixture, userInterestTagsFixture, userFollowsFixture } from '../lib/fixtures'

export function OnboardingStep1() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()

  // Attendee state
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [selectedOrganisers, setSelectedOrganisers] = useState<number[]>([])

  // Organiser state
  const [docs, setDocs] = useState(user?.docs || '')

  if (!user) return null

  const isOrganiser = user.role === 'ORGANISER'

  // Get only organiser users for attendee selection
  const organisers = usersFixture.filter((u) => u.role === 'ORGANISER' && u.user_id !== user.user_id)

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const toggleOrganiser = (orgId: number) => {
    setSelectedOrganisers((prev) =>
      prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
    )
  }

  const handleSubmit = () => {
    if (isOrganiser) {
      // Save Verification Docs to the user profile
      updateProfile({ docs: docs || null })
    } else {
      // Save selections to fixtures in-memory
      selectedTags.forEach((tagId) => {
        const exists = userInterestTagsFixture.some(
          (fit) => fit.user_id === user.user_id && fit.tag_id === tagId
        )
        if (!exists) {
          userInterestTagsFixture.push({ user_id: user.user_id, tag_id: tagId })
        }
      })

      selectedOrganisers.forEach((orgId) => {
        const exists = userFollowsFixture.some(
          (f) => f.follower_id === user.user_id && f.following_id === orgId
        )
        if (!exists) {
          userFollowsFixture.push({
            follower_id: user.user_id,
            following_id: orgId,
            followed_at: new Date().toISOString(),
          })
        }
      })
    }

    // Route to Step 2
    navigate('/user/onboarding/step2')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-8 shadow-2xl space-y-8 relative">
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-accent to-purple-500 rounded-t-2xl" />

        {isOrganiser ? (
          /* Organiser View: Document Verification Step 1 */
          <>
            <div className="text-center">
              <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent/10 px-3 py-1 rounded-full">
                Step 1 of 2
              </span>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mt-3">
                Verify Your Organization
              </h1>
              <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
                Upload your business registration, license, or identity documents for verification.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Verification Document URL / Reference
                </label>
                <p className="text-xs text-text-secondary/80">
                  Provide a link to a Google Drive folder, PDF doc, or business license reference showing registration details.
                </p>
                <input
                  type="url"
                  placeholder="https://example.com/docs/business-license.pdf"
                  className="w-full rounded-xl bg-surface-alt border border-border px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent"
                  value={docs}
                  onChange={(e) => setDocs(e.target.value)}
                />
              </div>
            </div>
          </>
        ) : (
          /* Attendee View: Let Us Know You Step 1 */
          <>
            <div className="text-center">
              <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent/10 px-3 py-1 rounded-full">
                Step 1 of 2
              </span>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mt-3">
                Let Us Know You
              </h1>
              <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
                Tell us what you like so we can recommend the best events in your area.
              </p>
            </div>

            <div className="space-y-6">
              {/* Preferred Categories Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Fill up your preferred categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {interestTagsFixture.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all duration-150 ${
                          isSelected
                            ? 'bg-accent border-accent text-white shadow-md shadow-accent/20'
                            : 'border-border bg-surface-alt/50 text-text-secondary hover:text-text-primary hover:border-text-secondary/50'
                        }`}
                      >
                        {tag.tag_name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Preferred Organisers Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Fill up your preferred organizers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {organisers.map((org) => {
                    const isSelected = selectedOrganisers.includes(org.user_id)
                    return (
                      <button
                        key={org.user_id}
                        type="button"
                        onClick={() => toggleOrganiser(org.user_id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-150 ${
                          isSelected
                            ? 'border-accent bg-accent/5 ring-1 ring-accent'
                            : 'border-border bg-surface-alt/30 hover:bg-surface-alt/50 hover:border-text-secondary/30'
                        }`}
                      >
                        <img
                          src={org.pfp_url || 'https://picsum.photos/seed/organizer/100'}
                          alt={org.name}
                          className="w-12 h-12 rounded-full object-cover border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-text-primary truncate">
                            {org.name}
                          </p>
                          <p className="text-xs text-text-secondary truncate mt-0.5">
                            {org.description || 'Event organiser on Gatherly'}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-accent bg-accent text-white'
                              : 'border-border bg-surface'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Buttons footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/80">
          <button
            onClick={() => navigate('/user/onboarding/step2')}
            className="px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            Skip Now
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
          >
            Submit & Next
          </button>
        </div>
      </div>
    </div>
  )
}
export default OnboardingStep1
