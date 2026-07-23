
import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { adminVerificationRequests } from '../lib/fixtures/adminMocks'

export function AdminVerification() {
  const [search, setSearch] = useState('')
  const [requests, setRequests] = useState(adminVerificationRequests)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const [reason, setReason] = useState('')

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) || null

  const filteredRequests = useMemo(() => {
    const term = search.toLowerCase()

    return requests.filter((item) => {
      if (item.status !== 'PENDING') {
        return false
      }

      const documentText = item.documents.map((doc) => doc.name).join(' ').toLowerCase()
      return item.username.toLowerCase().includes(term) || documentText.includes(term)
    })
  }, [requests, search])

  const handleApprove = (id: number) => {
    setRequests((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: 'APPROVED' } : item
      )
    )
  }

  const handleRejectClick = (id: number) => {
    setSelectedRequestId(id)
    setReason('')
  }

  const handleRejectConfirm = () => {
    if (selectedRequestId === null) return
    setRequests((items) =>
      items.map((item) =>
        item.id === selectedRequestId ? { ...item, status: 'REJECTED' } : item
      )
    )
    setReason('')
    setSelectedRequestId(null)
  }

  const handleAutoApprove = () => {
    setRequests((items) =>
      items.map((item) =>
        item.status === 'PENDING' ? { ...item, status: 'APPROVED' } : item
      )
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Verification Queue</h1>
            <p className="mt-2 text-text-secondary">Review pending organiser applications and approve or reject them quickly.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests"
              className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-text-primary placeholder:text-text-secondary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:max-w-sm"
            />
            <Button variant="primary" size="sm" onClick={handleAutoApprove} className="w-full sm:w-auto">
              Auto Approve with AI
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-alt text-text-secondary">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Documents</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} className="border-t border-border/70">
                <td className="px-4 py-4 text-text-primary">{request.username}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {request.documents.map((doc) => (
                      <a
                        key={doc.name}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent transition hover:bg-accent/20"
                      >
                        {doc.name}
                      </a>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-text-secondary">{request.submittedAt}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRejectClick(request.id)}
                      disabled={request.status !== 'PENDING'}
                    >
                      {request.status === 'REJECTED' ? 'Rejected' : 'Reject'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={request.status !== 'PENDING'}
                    >
                      {request.status === 'APPROVED' ? 'Approved' : 'Approve'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={selectedRequestId !== null} onClose={() => setSelectedRequestId(null)}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            Reason to reject {selectedRequest?.username}
          </h2>
          <p className="text-sm text-text-secondary">
            Provide a short rejection note for the organizer verification request.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-border bg-surface p-4 text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Enter rejection reason"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSelectedRequestId(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRejectConfirm} disabled={!reason.trim()}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

export default AdminVerification
