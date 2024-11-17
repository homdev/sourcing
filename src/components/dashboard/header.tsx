'use client'

import { Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface DashboardHeaderProps {
  title: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <SidebarTrigger className="md:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SidebarTrigger>
      </div>
    </header>
  )
}