import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function AdminSettings() {
  const [autoApprove, setAutoApprove] = useState(true)
  const [notifyNewReports, setNotifyNewReports] = useState(true)
  const [supportEmail, setSupportEmail] = useState('support@gatherly.app')

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Admin Settings</h1>
            <p className="mt-2 text-text-secondary">Configure moderation and notification preferences for the platform.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-alt p-6">
              <h2 className="text-lg font-semibold text-text-primary">Moderation Settings</h2>
              <p className="text-sm text-text-secondary mt-1">Control how admin moderation behaves across the platform.</p>

              <div className="mt-6 space-y-4">
                <label className="flex items-center gap-3 rounded-2xl border border-border bg-[#161618] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    className="h-5 w-5 rounded border-border bg-[#141416] text-accent focus:ring-accent"
                  />
                  <div>
                    <p className="font-semibold text-text-primary">Auto-approve organizer verifications</p>
                    <p className="text-sm text-text-secondary">Allow the AI workflow to approve trusted submissions automatically.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-border bg-[#161618] px-4 py-4">
                  <input
                    type="checkbox"
                    checked={notifyNewReports}
                    onChange={(e) => setNotifyNewReports(e.target.checked)}
                    className="h-5 w-5 rounded border-border bg-[#141416] text-accent focus:ring-accent"
                  />
                  <div>
                    <p className="font-semibold text-text-primary">Notify on new reports</p>
                    <p className="text-sm text-text-secondary">Send an alert when a new moderation report is filed.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-alt p-6">
              <h2 className="text-lg font-semibold text-text-primary">Support & audit</h2>
              <p className="text-sm text-text-secondary mt-1">Platform contact and audit settings for admin workflows.</p>

              <div className="mt-6 space-y-4">
                <Input
                  label="Support email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
                <div className="rounded-2xl border border-border bg-[#141416] p-4">
                  <p className="text-sm text-text-secondary">Changes are saved locally in this demo. In production, these values will be managed through backend settings.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="primary">Save settings</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminSettings
