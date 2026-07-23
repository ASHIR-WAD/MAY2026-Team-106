export interface AdminDashboardMetric {
  title: string
  value: string
  description: string
}

export interface AdminEventModerationItem {
  id: number
  eventTitle: string
  organiser: string
  status: 'LIVE' | 'PENDING' | 'FLAGGED'
  moderationReason?: string
}

export interface AdminOrganiserModerationItem {
  id: number
  organiser: string
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'SUSPENDED'
}

export interface AdminVerificationRequest {
  id: number
  username: string
  documents: Array<{ name: string; url: string }>
  submittedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface AdminReportItem {
  id: number
  target: string
  reporter: string
  reportType: string
  reason: string
  status: 'OPEN' | 'RESOLVED'
}

export const adminDashboardMetrics: AdminDashboardMetric[] = [
  {
    title: 'Profile reviews pending',
    value: '8',
    description: 'Organizer applications waiting for manual approval.',
  },
  {
    title: 'Events live',
    value: '24',
    description: 'Active event listings across the platform.',
  },
  {
    title: 'Reports to review',
    value: '5',
    description: 'Open moderation reports needing attention.',
  },
]

export const adminEventModerationItems: AdminEventModerationItem[] = [
  {
    id: 1,
    eventTitle: 'Summer Sunset Rave',
    organiser: 'Beatworks Events',
    status: 'FLAGGED',
  },
  {
    id: 2,
    eventTitle: 'RunClub Midnight Marathon',
    organiser: 'RunClub Gurugram',
    status: 'LIVE',
  },
  {
    id: 3,
    eventTitle: 'LaughTrack Comedy Night',
    organiser: 'LaughTrack Co.',
    status: 'PENDING',
  },
]

export const adminOrganiserModerationItems: AdminOrganiserModerationItem[] = [
  {
    id: 1,
    organiser: 'Beatworks Events',
    status: 'ACTIVE',
  },
  {
    id: 2,
    organiser: 'RunClub Gurugram',
    status: 'ACTIVE',
  },
  {
    id: 3,
    organiser: 'LaughTrack Co.',
    status: 'UNDER_REVIEW',
  },
]

export const adminVerificationRequests: AdminVerificationRequest[] = [
  {
    id: 1,
    username: 'bookings@laughtrack.co',
    documents: [
      { name: 'Government ID', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { name: 'Business License', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ],
    submittedAt: '2026-07-10',
    status: 'PENDING',
  },
  {
    id: 2,
    username: 'neworganiser@events.io',
    documents: [
      { name: 'Government ID', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { name: 'GST Certificate', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ],
    submittedAt: '2026-07-12',
    status: 'PENDING',
  },
  {
    id: 3,
    username: 'future.events@live.com',
    documents: [
      { name: 'Business Registration', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
    ],
    submittedAt: '2026-07-13',
    status: 'PENDING',
  },
]

export const adminReports: AdminReportItem[] = [
  {
    id: 1,
    target: 'Summer Sunset Rave',
    reporter: 'Arjun Kumar',
    reportType: 'Event content',
    reason: 'Event description contains misleading venue details.',
    status: 'OPEN',
  },
  {
    id: 2,
    target: 'RunClub Gurugram',
    reporter: 'Rhea Sharma',
    reportType: 'Organizer behaviour',
    reason: 'Organizer repeatedly cancelled events last minute.',
    status: 'OPEN',
  },
  {
    id: 3,
    target: 'LaughTrack Comedy Night',
    reporter: 'Sonal Patel',
    reportType: 'Ticketing issue',
    reason: 'Attendee received no confirmation after purchase.',
    status: 'OPEN',
  },
]
