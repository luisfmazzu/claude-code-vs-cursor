import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuClick = () => {
    setSidebarOpen(true)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <Header onMenuClick={handleMenuClick} />

        {/* Page content */}
        <main 
          className={cn(
            'flex-1 overflow-y-auto p-4 lg:p-6',
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout