import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { HomePage } from '../pages/HomePage'
import { EventDetailPage } from '../pages/EventDetailPage'
import { OrganiserProfilePage } from '../pages/OrganiserProfilePage'
import { BookingsPage } from '../pages/BookingsPage'
import { FavouritesPage } from '../pages/FavouritesPage'
import { ProfileUpdatePage } from '../pages/ProfileUpdatePage'
import { EventBookPage } from '../pages/EventBookPage'
import Login from '../pages/Login'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/event/:eventId" element={<EventDetailPage />} />
      <Route path="/organiser/:organiserId" element={<OrganiserProfilePage />} />
      <Route path="/auth/login" element={<Login />} />

      {/* Protected */}
      <Route
        path="/user/bookings"
        element={
          <RequireAuth>
            <BookingsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/user/favourites"
        element={
          <RequireAuth>
            <FavouritesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/user/update"
        element={
          <RequireAuth>
            <ProfileUpdatePage />
          </RequireAuth>
        }
      />
      <Route
        path="/event/:eventId/book"
        element={
          <RequireAuth>
            <EventBookPage />
          </RequireAuth>
        }
      />
    </Routes>
  )
}
