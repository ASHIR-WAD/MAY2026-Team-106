export type UserRole = 'ATTENDEE' | 'ORGANISER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED'

export interface Users {
  user_id: number
  email: string
  password_hash: string
  role: UserRole
  name: string
  phone: string | null
  created_at: string
  status: UserStatus
  pfp_url: string | null
  dob: string | null
  description: string | null

  bookmarks: number[]
}
