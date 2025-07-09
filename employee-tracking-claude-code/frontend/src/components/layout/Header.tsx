import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Bell, User, LogOut, Settings, Menu } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface HeaderProps {
  onMenuClick?: () => void
  className?: string
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, className }) => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header
      className={cn(
        'bg-white border-b border-neutral-200 shadow-sm',
        'flex items-center justify-between px-4 py-3',
        className
      )}
    >
      {/* Left side */}
      <div className="flex items-center space-x-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="sm"
            icon={Menu}
            onClick={onMenuClick}
            className="lg:hidden"
          />
        )}
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ET</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">
              Employee Tracking
            </h1>
            <p className="text-xs text-neutral-500 hidden sm:block">
              AI-Powered Absenteeism Management
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            icon={Bell}
            className="relative"
          />
          <Badge
            variant="error"
            size="sm"
            className="absolute -top-1 -right-1 px-1 min-w-0 h-5"
          >
            3
          </Badge>
        </div>

        {/* User menu */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-neutral-900">
              {user?.name}
            </p>
            <p className="text-xs text-neutral-500 capitalize">
              {user?.role}
            </p>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              icon={Settings}
              className="text-neutral-600"
            />
            
            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={handleSignOut}
              className="text-neutral-600 hover:text-error-600"
            />
          </div>

          {/* User avatar */}
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header