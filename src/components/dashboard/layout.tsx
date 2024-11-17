'use client'

import { ReactNode } from 'react'
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from './sidebar'
import { DashboardHeader } from './header'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DashboardLayout({ 
  children, 
  title, 
  activeSection, 
  onSectionChange 
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-gray-100">
        <DashboardSidebar 
          activeSection={activeSection} 
          onSectionChange={onSectionChange} 
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title={title} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}