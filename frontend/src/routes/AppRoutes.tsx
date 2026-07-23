import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { HomePage } from '../pages/HomePage'
import { EventDetailPage } from '../pages/EventDetailPage'
import { OrganiserProfilePage } from '../pages/OrganiserProfilePage'
import { BookingsPage } from '../pages/BookingsPage'
import { FavouritesPage } from '../pages/FavouritesPage'
import { ProfileUpdatePage } from '../pages/ProfileUpdatePage'
import { ChooseTicketsPage } from '../pages/ChooseTicketsPage'
import { TicketConfirmationPage } from '../pages/TicketConfirmationPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import Login from '../pages/Login'
import Signup from '../pages/Signup'

import { OrganiserHomePage } from '../pages/org/OrganiserHomePage'
import { OrganiserAnalytics } from '../pages/OrganiserAnalytics'
import { YourEventsPage } from '../pages/org/YourEventsPage'
import { EventFormPage } from '../pages/org/EventFormPage'

import { AdminHome } from '../pages/AdminHome'
import { AdminEventReviewPage } from '../pages/AdminEventReviewPage'
import AdminVerification from '../pages/AdminVerification'
import { AdminReports } from '../pages/AdminReports'

import { OnboardingStep1 } from '../pages/OnboardingStep1'
import { OnboardingStep2 } from '../pages/OnboardingStep2'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />

      {/* Protected Routes Layout */}
      <Route element={<AuthenticatedShell />}>
        {/* Attendee Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:eventId" element={<EventDetailPage />} />
        <Route path="/organiser/:organiserId" element={<OrganiserProfilePage />} />
        <Route path="/user/bookings" element={<BookingsPage />} />
        <Route path="/user/favourites" element={<FavouritesPage />} />
        <Route path="/user/update" element={<ProfileUpdatePage />} />
        <Route path="/event/:eventId/book" element={<ChooseTicketsPage />} />
        <Route path="/ticket/:orderId" element={<TicketConfirmationPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/user/onboarding/step1" element={<OnboardingStep1 />} />
        <Route path="/user/onboarding/step2" element={<OnboardingStep2 />} />

        {/* Organiser Routes */}
        <Route path="/org" element={<OrganiserHomePage />} />
        <Route path="/org/analytics" element={<OrganiserAnalytics />} />
        <Route path="/org/events" element={<YourEventsPage />} />
        <Route path="/org/events/new" element={<EventFormPage />} />
        <Route path="/org/events/:eventId/edit" element={<EventFormPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/events/:eventId/review" element={<AdminEventReviewPage />} />
        <Route path="/admin/verification" element={<AdminVerification />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
