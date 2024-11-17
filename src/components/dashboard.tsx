'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Phone, Globe, Star, Users, Menu, Home, Mail, UserPlus, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Annonce, AnnonceCardProps } from '@/types/dashboard'

function AnnonceCard({ annonce }: AnnonceCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{annonce.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          <span>{annonce.rating} ({annonce.reviews} avis)</span>
        </div>
        <div className="flex items-center mb-2">
          <Phone className="h-4 w-4 mr-1" />
          <span>{annonce.phone}</span>
        </div>
        <div className="flex items-center mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{annonce.address}</span>
        </div>
        <a href={annonce.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
          <Globe className="h-4 w-4 mr-1" />
          <span>Visiter le site</span>
        </a>
      </CardContent>
    </Card>
  )
}

export function DashboardComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [results, setResults] = useState<Annonce[]>([])
  const [viewMode, setViewMode] = useState('list')
  const [activeSection, setActiveSection] = useState('sourcing')

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Simulation de résultats de recherche
    const mockResults: Annonce[] = [
      {
        name: "Agence Immobilière ABC",
        rating: 4.5,
        reviews: 120,
        phone: "02 40 12 34 56",
        address: "1 Rue de la Paix, 44000 Nantes",
        website: "https://www.agenceabc.fr"
      },
      {
        name: "Immobilier XYZ",
        rating: 4.2,
        reviews: 85,
        phone: "02 40 98 76 54",
        address: "15 Avenue des Fleurs, 44200 Nantes",
        website: "https://www.immobilierxyz.com"
      },
      {
        name: "Maisons & Co",
        rating: 4.8,
        reviews: 150,
        phone: "02 40 11 22 33",
        address: "8 Boulevard des Arbres, 44300 Nantes",
        website: "https://www.maisons-et-co.fr"
      },
    ]
    setResults(mockResults)
  }

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-gray-100">
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-xl font-bold px-4 py-2">Dashboard Pro</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center" onClick={() => setActiveSection('accueil')}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Accueil</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center" onClick={() => setActiveSection('sourcing')}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>Sourcing</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center" onClick={() => setActiveSection('mailing')}>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Mailing</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center" onClick={() => setActiveSection('contacts')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Contacts</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" className="flex items-center" onClick={() => setActiveSection('parametres')}>
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

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm z-10">
            <div className="max-w-7xl py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard Commercial</h1>
              <SidebarTrigger className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SidebarTrigger>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activeSection === 'sourcing' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recherche Entreprises</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow">
                          <Input
                            type="text"
                            placeholder="Domaine (ex: agent immobilier)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="flex-grow">
                          <Input
                            type="text"
                            placeholder="Localisation (ex: Nantes)"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <Button type="submit" className="w-full sm:w-auto">
                          <Search className="mr-2 h-4 w-4" /> Rechercher
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {results.length > 0 && (
                    <Card className="mt-8">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Résultats de la recherche</CardTitle>
                          <div className="flex items-center space-x-2">
                            <span>Vue en liste</span>
                            <Switch
                              checked={viewMode === 'grid'}
                              onCheckedChange={(checked) => setViewMode(checked ? 'grid' : 'list')}
                            />
                            <span>Vue en grille</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {viewMode === 'list' ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nom</TableHead>
                                  <TableHead>Note</TableHead>
                                  <TableHead>Avis</TableHead>
                                  <TableHead>Téléphone</TableHead>
                                  <TableHead>Adresse</TableHead>
                                  <TableHead>Site Web</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {results.map((result, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{result.name}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                        {result.rating}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-1" />
                                        {result.reviews}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-1" />
                                        {result.phone}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {result.address}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <a href={result.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                                        <Globe className="h-4 w-4 mr-1" />
                                        Visiter
                                      </a>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.map((result, index) => (
                              <AnnonceCard key={index} annonce={result} />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
              {activeSection !== 'sourcing' && (
                <Card>
                  <CardHeader>
                    <CardTitle>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Contenu de la section {activeSection} à venir...</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}