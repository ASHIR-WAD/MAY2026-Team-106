import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context'

interface NavTabsProps {
  layout?: 'horizontal' | 'vertical'
  onTabClick?: () => void
}

export function NavTabs({ layout = 'horizontal', onTabClick }: NavTabsProps) {
  const { user } = useAuth()

  if (!user) return null

  // Define tabs based on role
  const tabConfigs = {
    ATTENDEE: [
      { name: 'For You', path: '/' },
      { name: 'Favorites', path: '/user/favourites' },
      { name: 'Your Bookings', path: '/user/bookings' },
    ],
    ORGANISER: [
      { name: 'Home', path: '/org' },
      { name: 'Analytics', path: '/org/analytics' },
      { name: 'Your Events', path: '/org/events' },
    ],
    ADMIN: [
      { name: 'Home', path: '/admin' },
      { name: 'Verification', path: '/admin/verification' },
      { name: 'Reports', path: '/admin/reports' },
    ],
  }

  const tabs = tabConfigs[user.role] || []

  const baseStyle = 'transition-all duration-300 text-sm font-medium focus:outline-none'

  const getClassName = (isActive: boolean) => {
    if (layout === 'vertical') {
      return `${baseStyle} block px-4 py-2.5 rounded-lg ${
        isActive
          ? 'bg-accent/10 text-accent font-semibold'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
      }`
    } else {
      return `${baseStyle} px-4 py-1.5 rounded-lg border ${
        isActive
          ? 'text-text-primary font-semibold bg-surface border-border/80 shadow-sm'
          : 'text-text-secondary hover:text-text-primary border-transparent'
      }`
    }
  }

  return (
    <nav
      className={
        layout === 'vertical'
          ? 'flex flex-col space-y-1 w-full px-2'
          : 'flex items-center gap-1 border border-border/80 rounded-xl p-1 bg-surface-alt/30 backdrop-blur-md shadow-inner'
      }
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.path === '/' || tab.path === '/org' || tab.path === '/admin'}
          className={({ isActive }) => getClassName(isActive)}
          onClick={onTabClick}
        >
          {tab.name}
        </NavLink>
      ))}
    </nav>
  )
}
