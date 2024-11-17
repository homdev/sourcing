import { Handler } from '@netlify/functions'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { GooglePlacesScraper } from '../../src/services/scraping/googlePlaces'
import type { ScrapedCompany } from '../../src/types/dashboard'

const prisma = new PrismaClient().$extends(withAccelerate())

export const handler: Handler = async (event) => {
  try {
    // Route GET /api/companies
    if (event.path.includes('/api/companies') && event.httpMethod === 'GET') {
      // Conversion des paramètres de requête en objet
      const queryParams: Record<string, string> = {}
      if (event.queryStringParameters) {
        Object.entries(event.queryStringParameters).forEach(([key, value]) => {
          if (value) queryParams[key] = value
        })
      }

      const page = parseInt(queryParams.page || '1')
      const limit = parseInt(queryParams.limit || '10')
      const filters = JSON.parse(queryParams.filters || '{}')

      const where = {
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { city: { contains: filters.search, mode: 'insensitive' } }
          ]
        })
      }

      const [items, total] = await Promise.all([
        prisma.company.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where,
          include: {
            contacts: true,
            tags: true,
            scrapingLogs: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { lastUpdate: 'desc' }
        }),
        prisma.company.count({ where })
      ])

      return {
        statusCode: 200,
        body: JSON.stringify({
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit)
        })
      }
    }

    // Route POST /api/scraping
    if (event.path.includes('/api/scraping') && event.httpMethod === 'POST') {
      const { query, location } = JSON.parse(event.body || '{}')
      
      if (!query || !location) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Query et location sont requis' })
        }
      }

      const scraper = new GooglePlacesScraper()
      try {
        const results = await scraper.scrapeCompany(query, location)
        
        // Convertir et sauvegarder les résultats
        const savedCompanies = await Promise.all(
          results.map((company: ScrapedCompany) => 
            prisma.company.create({
              data: {
                name: company.name,
                address: company.address || '',
                phone: company.phone || '',
                website: company.website || '',
                rating: typeof company.rating === 'string' ? parseFloat(company.rating) || 0 : company.rating || 0,
                reviews: typeof company.reviews === 'string' ? parseInt(company.reviews) || 0 : company.reviews || 0,
                status: 'COMPLETED',
                city: location,
                source: 'GOOGLE_PLACES',
                lastUpdate: new Date(),
                lastScraped: new Date()
              }
            })
          )
        )

        return {
          statusCode: 200,
          body: JSON.stringify({ 
            success: true, 
            message: `${savedCompanies.length} entreprises sauvegardées`,
            data: savedCompanies 
          })
        }
      } finally {
        await scraper.close()
      }
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Route non trouvée' })
    }

  } catch (error) {
    console.error('Erreur API:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    }
  }
}