
import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { adminReports } from '../lib/fixtures/adminMocks'

export function AdminReports() {
  const [search, setSearch] = useState('')
  const [reports, setReports] = useState(adminReports)

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.target.toLowerCase().includes(search.toLowerCase()) ||
          report.reporter.toLowerCase().includes(search.toLowerCase()) ||
          report.reportType.toLowerCase().includes(search.toLowerCase())
      ),
    [reports, search]
  )

  const handleResolve = (id: number) => {
    setReports((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: 'RESOLVED' } : item
      )
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Platform Reports</h1>
            <p className="mt-2 text-text-secondary">Review incoming reports and resolve issues quickly.</p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports"
            className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-text-primary placeholder:text-text-secondary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:max-w-sm"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-alt text-text-secondary">
            <tr>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="border-t border-border/70">
                <td className="px-4 py-4 text-text-primary">{report.target}</td>
                <td className="px-4 py-4 text-text-secondary">{report.reporter}</td>
                <td className="px-4 py-4 text-text-secondary">{report.reportType}</td>
                <td className="px-4 py-4 max-w-xl truncate text-text-secondary">{report.reason}</td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-semibold text-text-secondary">
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleResolve(report.id)}
                  >
                    Resolve
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminReports
