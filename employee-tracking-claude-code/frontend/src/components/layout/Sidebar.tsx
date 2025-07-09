import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Mail, 
  FileSpreadsheet, 
  Settings, 
  CreditCard,
  BarChart3,
  X
} from 'lucide-react'
import Button from '@/components/ui/Button'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navigation: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/employees',
    label: 'Employees',
    icon: Users,
  },
  {
    href: '/absences',
    label: 'Absences',
    icon: UserCheck,
    badge: '12',
  },
  {
    href: '/email-integration',
    label: 'Email Integration',
    icon: Mail,
  },
  {
    href: '/data-import',
    label: 'Data Import',
    icon: FileSpreadsheet,
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    href: '/billing',
    label: 'Billing',
    icon: CreditCard,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, className }) => {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 shadow-sm',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 lg:hidden">
          <h2 className="text-lg font-semibold text-neutral-900">Menu</h2>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={onClose}
            />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                )}
                onClick={onClose}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-neutral-200">
          <div className="bg-primary-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-primary-900 mb-1">
              Upgrade to Pro
            </h3>
            <p className="text-xs text-primary-700 mb-2">
              Get unlimited employees and advanced features.
            </p>
            <Button
              size="sm"
              variant="primary"
              fullWidth
              className="text-xs"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar