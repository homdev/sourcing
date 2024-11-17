'use client'

import { Home, Search, Mail, UserPlus, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface DashboardSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DashboardSidebar({ activeSection, onSectionChange }: DashboardSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-xl font-bold px-4 py-2">Dashboard Pro</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a 
                href="#" 
                className={`flex items-center ${activeSection === 'accueil' ? 'text-primary' : ''}`}
                onClick={() => onSectionChange('accueil')}
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Accueil</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a 
                href="#" 
                className={`flex items-center ${activeSection === 'sourcing' ? 'text-primary' : ''}`}
                onClick={() => onSectionChange('sourcing')}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Sourcing</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a 
                href="#" 
                className={`flex items-center ${activeSection === 'mailing' ? 'text-primary' : ''}`}
                onClick={() => onSectionChange('mailing')}
              >
                <Mail className="mr-2 h-4 w-4" />
                <span>Mailing</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a 
                href="#" 
                className={`flex items-center ${activeSection === 'contacts' ? 'text-primary' : ''}`}
                onClick={() => onSectionChange('contacts')}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Contacts</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a 
                href="#" 
                className={`flex items-center ${activeSection === 'parametres' ? 'text-primary' : ''}`}
                onClick={() => onSectionChange('parametres')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <p className="text-sm text-gray-500 px-4 py-2">© 2024 Dashboard Pro</p>
      </SidebarFooter>
    </Sidebar>
  )
}