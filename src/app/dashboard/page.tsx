'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardLayout } from "@/components/dashboard/layout"
import { SourcingContent } from "@/components/dashboard/sourcing"
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('sourcing')

  const renderContent = () => {
    switch (activeSection) {
      case 'sourcing':
        return <SourcingContent />
      case 'mailing':
        return <div>Mailing Content</div>
      case 'contacts':
        return <div>Contacts Content</div>
      case 'parametres':
        return <div>Paramètres Content</div>
      default:
        return <div>Dashboard Overview</div>
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout 
        title={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      >
        {renderContent()}
      </DashboardLayout>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}