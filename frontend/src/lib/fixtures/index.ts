import { eventsFixture } from './events'
import { usersFixture } from './users'

/** In-memory GET path → fixture data (Module 3 stand-in). */
export const mockGetRoutes: Record<string, unknown> = {
  '/events': eventsFixture,
  '/users': usersFixture,
}

/** In-memory POST path → fixture response factory. */
export const mockPostRoutes: Record<string, (body: unknown) => unknown> = {
  '/events': (body) => ({
    id: eventsFixture.length + 1,
    ...(typeof body === 'object' && body !== null ? body : {}),
  }),
}

export { eventsFixture, usersFixture }
