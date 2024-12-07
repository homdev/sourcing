'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Phone, Globe, Star, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CompanyListViewProps, CompanyGridViewProps } from '@/types/dashboard'

export function SourcingContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const { 
    data: companiesData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['companies', currentPage, itemsPerPage, searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/companies?${new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        filters: JSON.stringify({
          search: searchQuery,
          location: searchLocation
        })
      })}`)

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }

      return response.json()
    }
  })

  useEffect(() => {
    console.log('Current companies data:', companiesData);
  }, [companiesData]);

  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, location: searchLocation })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors du scraping')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Scraping terminé avec succès')
      refetch()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du scraping')
    }
  })

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/companies/export?${new URLSearchParams({
        filters: JSON.stringify({
          search: searchQuery,
          location: searchLocation
        })
      })}`)

      if (!response.ok) throw new Error('Erreur lors de l\'export')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `companies_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Export réussi')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
      console.error(error)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-4">
          <span>Chargement...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 p-4">
          Erreur lors du chargement des données
        </div>
      );
    }

    if (!companiesData?.items?.length) {
      return (
        <div className="text-center p-4">
          Aucune entreprise trouvée
        </div>
      );
    }

    return viewMode === 'list' ? (
      <CompanyListView
        companies={companiesData.items}
        currentPage={currentPage}
        totalPages={companiesData.totalPages}
        onPageChange={setCurrentPage}
      />
    ) : (
      <CompanyGridView companies={companiesData.items} />
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recherche Entreprises</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!searchQuery || !searchLocation) {
              toast.error('Veuillez remplir tous les champs')
              return
            }
            scrapeMutation.mutate()
          }} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Nom ou type d'entreprise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={scrapeMutation.isPending}
              />
              <Input
                placeholder="Localisation..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                disabled={scrapeMutation.isPending}
              />
              <Button type="submit" disabled={scrapeMutation.isPending}>
                {scrapeMutation.isPending ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Résultats ({companiesData?.total || 0} entreprises)</CardTitle>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={!companiesData?.items?.length}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                checked={viewMode === 'grid'}
                onCheckedChange={(checked) => setViewMode(checked ? 'grid' : 'list')}
              />
              <span>Vue grille</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}

// Composants auxiliaires pour les vues
function CompanyListView({ companies, currentPage, totalPages, onPageChange }: CompanyListViewProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Site Web</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.name}</TableCell>
              <TableCell>
                {company.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{company.rating} ({company.reviews})</span>
                  </div>
                )}
              </TableCell>
              <TableCell>{company.phone}</TableCell>
              <TableCell>{company.address}</TableCell>
              <TableCell>
                {company.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Visiter
                  </a>
                )}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  company.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  company.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {company.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <Button
            key={i}
            variant={currentPage === i + 1 ? "default" : "outline"}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  )
}

function CompanyGridView({ companies }: CompanyGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <Card key={company.id} className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">{company.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{company.rating} ({company.reviews} avis)</span>
            </div>
            <div className="flex items-center mb-2">
              <Phone className="h-4 w-4 mr-1" />
              <span>{company.phone}</span>
            </div>
            <div className="flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{company.address}</span>
            </div>
            {company.website && (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-blue-600 hover:underline"
              >
                <Globe className="h-4 w-4 mr-1" />
                <span>Visiter le site</span>
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}